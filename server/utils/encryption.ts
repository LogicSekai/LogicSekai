/**
 * AES-256-GCM encryption for sensitive credentials (payment keys, etc.)
 *
 * Uses Web Crypto API (globalThis.crypto.subtle) — works in both
 * Cloudflare Workers (with nodejs_compat) and Node.js >= 19.
 *
 * Key management / rotation:
 *   ENCRYPTION_MASTER_KEY      — v1 key (base64-encoded, 32 bytes / 256-bit)
 *   ENCRYPTION_MASTER_KEY_V2   — v2 key (rotation)
 *   ENCRYPTION_MASTER_KEY_V3   — v3 key (rotation)
 *   ... and so on
 *
 * Generate a key:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * Rotation workflow:
 *   1. Generate a new key, set it as ENCRYPTION_MASTER_KEY_V{n+1}
 *   2. Keep all previous version keys in env (needed to decrypt old ciphertext)
 *   3. Call POST /api/creator/payment-gateway/rotate-key — re-encrypts in-place
 *   4. Once all rows are migrated, old keys may be retired
 *
 * Stored format:
 *   v{version}:<base64(iv[12 bytes] || gcm_ciphertext_with_tag[n+16 bytes])>
 *
 * The 16-byte GCM auth tag is appended by SubtleCrypto automatically and
 * verified on decrypt — any tampering causes a hard failure.
 */

const ALGORITHM = 'AES-GCM' as const
const IV_BYTES   = 12   // 96-bit IV — NIST recommended for GCM
const TAG_BITS   = 128  // 128-bit auth tag

// ─── Base64 helpers (no Buffer dependency) ───────────────────────────────────

function b64Encode(buf: ArrayBuffer | Uint8Array): string {
    const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
    return btoa(binary)
}

function b64Decode(str: string): Uint8Array {
    const binary = atob(str)
    const arr = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
    return arr
}

// ─── Key import ───────────────────────────────────────────────────────────────

function envKeyName(version: number): string {
    return version === 1 ? 'ENCRYPTION_MASTER_KEY' : `ENCRYPTION_MASTER_KEY_V${version}`
}

async function importKey(version: number): Promise<CryptoKey> {
    const name = envKeyName(version)
    const raw  = process.env[name]?.trim()
    if (!raw) throw new Error(`[encryption] ${name} is not set in environment`)

    const bytes = b64Decode(raw)
    if (bytes.length !== 32) {
        throw new Error(`[encryption] ${name} must be 32 bytes (256-bit) base64-encoded`)
    }

    return globalThis.crypto.subtle.importKey(
        'raw',
        bytes,
        { name: ALGORITHM, length: 256 },
        false,              // non-extractable — key cannot be read back
        ['encrypt', 'decrypt'],
    )
}

/** Returns the highest key version configured in the environment. */
function latestVersion(): number {
    for (let v = 20; v >= 2; v--) {
        if (process.env[`ENCRYPTION_MASTER_KEY_V${v}`]?.trim()) return v
    }
    return 1
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Encrypt `plaintext` with the current latest master key.
 * Returns: `v{version}:<base64(iv + ciphertext_with_gcm_tag)>`
 */
export async function encryptSecret(plaintext: string): Promise<string> {
    const version = latestVersion()
    const key     = await importKey(version)
    const iv      = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES))

    const cipherBuf = await globalThis.crypto.subtle.encrypt(
        { name: ALGORITHM, iv, tagLength: TAG_BITS },
        key,
        new TextEncoder().encode(plaintext),
    )

    // Prepend IV so we can extract it during decrypt
    const payload = new Uint8Array(IV_BYTES + cipherBuf.byteLength)
    payload.set(iv, 0)
    payload.set(new Uint8Array(cipherBuf), IV_BYTES)

    return `v${version}:${b64Encode(payload)}`
}

/**
 * Decrypt a value produced by `encryptSecret`.
 * Throws if the auth tag does not match (tamper detection).
 */
export async function decryptSecret(encrypted: string): Promise<string> {
    const sep = encrypted.indexOf(':')
    if (sep < 2 || encrypted[0] !== 'v') {
        throw new Error('[encryption] Invalid ciphertext format')
    }

    const version = parseInt(encrypted.slice(1, sep), 10)
    if (isNaN(version) || version < 1) {
        throw new Error('[encryption] Invalid key version in ciphertext')
    }

    const payload    = b64Decode(encrypted.slice(sep + 1))
    const iv         = payload.slice(0, IV_BYTES)
    const ciphertext = payload.slice(IV_BYTES)

    const key = await importKey(version)

    const plainBuf = await globalThis.crypto.subtle.decrypt(
        { name: ALGORITHM, iv, tagLength: TAG_BITS },
        key,
        ciphertext,
    )

    return new TextDecoder().decode(plainBuf)
}

/**
 * Re-encrypt an existing ciphertext with the current latest key version.
 * Used for key rotation — decrypt with old version, re-encrypt with new.
 */
export async function rotateEncryption(encrypted: string): Promise<string> {
    const plain = await decryptSecret(encrypted)
    return encryptSecret(plain)
}

/**
 * Extract the key version embedded in an encrypted value.
 * Returns 0 if the format is invalid.
 */
export function encryptedKeyVersion(encrypted: string): number {
    const sep = encrypted.indexOf(':')
    if (sep < 2) return 0
    return parseInt(encrypted.slice(1, sep), 10) || 0
}

/**
 * Returns true if the encrypted value was created with an older key version
 * than the one currently configured — i.e. it should be rotated.
 */
export function needsRotation(encrypted: string): boolean {
    return encryptedKeyVersion(encrypted) < latestVersion()
}

/**
 * Produce a display-safe mask for a secret.
 * Shows only the last 4 characters; everything else is replaced with •.
 * Stored in `masked_*_key` columns so dashboards never decrypt for display.
 *
 * Example: "SB-Mid-server-AbCdEfGh" → "••••••••••••••••••AbCd"
 */
export function maskSecret(secret: string): string {
    if (!secret) return '••••••••••••'
    if (secret.length <= 4) return '••••'
    return '•'.repeat(secret.length - 4) + secret.slice(-4)
}

/**
 * Partially mask an IP address for audit log storage.
 * IPv4: last octet replaced with *   (192.168.1.*)
 * IPv6: last group replaced with **** (2001:db8::**** )
 */
export function maskIp(ip: string): string {
    if (!ip || ip === 'unknown') return ip
    if (ip.includes('.')) {
        const parts = ip.split('.')
        return `${parts[0]}.${parts[1]}.${parts[2]}.*`
    }
    return ip.replace(/[^:]+$/, '****')
}

/**
 * Generate a cryptographically random callback/webhook token.
 * Returns a 64-character lowercase hex string (32 random bytes).
 * Use as the unguessable segment in a callback URL:
 *   /api/payments/callback/{token}
 */
export function generateCallbackToken(): string {
    const bytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}
