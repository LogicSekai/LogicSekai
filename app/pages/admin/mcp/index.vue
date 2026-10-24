<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    Plug, Plus, RefreshCw, KeyRound, Ban, CheckCircle2, Trash2, Copy, X,
    ShieldCheck, ShieldAlert, Clock, AlertTriangle, ScrollText,
} from 'lucide-vue-next'

definePageMeta({
    layout: 'superadmin',
    middleware: 'superadmin',
})

useHead({ title: 'Koneksi MCP — Admin' })

// ─── Types ──────────────────────────────────────────────────────────────
interface McpClient {
    id: string
    clientId: string
    name: string
    description: string | null
    maskedSecret: string
    scopes: string[]
    allowedIps: string[]
    status: 'active' | 'revoked'
    expiresAt: string | null
    lastUsedAt: string | null
    lastUsedIp: string | null
    secretRotatedAt: string | null
    createdAt: string
}
interface ScopeInfo { key: string; description: string; tools: string[] }
interface AuditLog {
    id: string
    clientId: string | null
    action: string
    toolName: string | null
    success: boolean
    errorCode: string | null
    ipAddress: string | null
    createdAt: string
}

// ─── State ──────────────────────────────────────────────────────────────
const clients = ref<McpClient[]>([])
const scopes = ref<ScopeInfo[]>([])
const endpoint = ref('')
const isLoading = ref(false)
const tab = ref<'clients' | 'logs'>('clients')

const logs = ref<AuditLog[]>([])
const logsLoading = ref(false)
const logsFailedOnly = ref(false)
const logsPage = ref(1)
const logsTotalPages = ref(1)

// Form
const showForm = ref(false)
const editing = ref<McpClient | null>(null)
const form = ref({ name: '', description: '', scopes: [] as string[], allowedIpsText: '', expiresInDays: '' as string | number })
const saving = ref(false)

// Secret reveal (sekali tampil)
const revealed = ref<{ client: McpClient; secret: string } | null>(null)

// Konfirmasi aksi berbahaya
const confirmAction = ref<{ type: 'rotate' | 'delete' | 'revoke'; client: McpClient } | null>(null)
const actionBusy = ref(false)

// ─── Fetch ──────────────────────────────────────────────────────────────
const fetchClients = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<any>('/api/admin/mcp/clients')
        clients.value = data.clients
        scopes.value = data.scopes
        endpoint.value = data.endpoint
    } catch (e: any) {
        useToaster('error', e?.data?.statusMessage || 'Gagal memuat klien MCP')
    } finally {
        isLoading.value = false
    }
}

const fetchLogs = async () => {
    logsLoading.value = true
    try {
        const data = await $fetch<any>('/api/admin/mcp/logs', {
            params: { page: logsPage.value, limit: 30, failedOnly: logsFailedOnly.value ? '1' : undefined },
        })
        logs.value = data.logs
        logsTotalPages.value = Math.max(1, data.pagination.totalPages)
    } catch (e: any) {
        useToaster('error', e?.data?.statusMessage || 'Gagal memuat log')
    } finally {
        logsLoading.value = false
    }
}

onMounted(fetchClients)

const switchTab = (t: 'clients' | 'logs') => {
    tab.value = t
    if (t === 'logs') { logsPage.value = 1; fetchLogs() }
}

// ─── Helpers ────────────────────────────────────────────────────────────
const fmt = (d: string | number | null) => {
    if (!d) return '—'
    const date = new Date(typeof d === 'number' && d < 1e12 ? d * 1000 : d)
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const isExpired = (c: McpClient) => !!c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()
const clientName = (cid: string | null) => clients.value.find(c => c.clientId === cid)?.name ?? cid ?? '—'

const stats = computed(() => ({
    total: clients.value.length,
    active: clients.value.filter(c => c.status === 'active' && !isExpired(c)).length,
    revoked: clients.value.filter(c => c.status === 'revoked').length,
    expired: clients.value.filter(c => c.status === 'active' && isExpired(c)).length,
}))

const copy = async (text: string, label = 'Disalin') => {
    try {
        await navigator.clipboard.writeText(text)
        useToaster('success', label)
    } catch {
        useToaster('error', 'Gagal menyalin — salin manual')
    }
}

const bridgeConfig = computed(() => {
    if (!revealed.value) return ''
    return JSON.stringify({
        mcpServers: {
            'logic-sekai': {
                command: 'node',
                args: ['/path/ke/mcp-signer.mjs'],
                env: {
                    LS_MCP_URL: endpoint.value,
                    LS_MCP_CLIENT_ID: revealed.value.client.clientId,
                    LS_MCP_SECRET: revealed.value.secret,
                },
            },
        },
    }, null, 2)
})

// ─── Form ───────────────────────────────────────────────────────────────
const openCreate = () => {
    editing.value = null
    form.value = { name: '', description: '', scopes: scopes.value.filter(s => s.key !== 'stats:read').map(s => s.key), allowedIpsText: '', expiresInDays: 90 }
    showForm.value = true
}
const openEdit = (c: McpClient) => {
    editing.value = c
    form.value = { name: c.name, description: c.description ?? '', scopes: [...c.scopes], allowedIpsText: c.allowedIps.join('\n'), expiresInDays: '' }
    showForm.value = true
}
const toggleScope = (key: string) => {
    const i = form.value.scopes.indexOf(key)
    i >= 0 ? form.value.scopes.splice(i, 1) : form.value.scopes.push(key)
}

const submitForm = async () => {
    saving.value = true
    const allowedIps = form.value.allowedIpsText.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
    const days = form.value.expiresInDays === '' ? undefined : Number(form.value.expiresInDays) || null
    try {
        if (editing.value) {
            const body: Record<string, unknown> = {
                name: form.value.name,
                description: form.value.description || null,
                scopes: form.value.scopes,
                allowedIps,
            }
            if (days !== undefined) body.expiresInDays = days
            await $fetch(`/api/admin/mcp/clients/${editing.value.id}`, { method: 'PATCH', body })
            useToaster('success', 'Klien diperbarui')
        } else {
            const res = await $fetch<any>('/api/admin/mcp/clients', {
                method: 'POST',
                body: {
                    name: form.value.name,
                    description: form.value.description || null,
                    scopes: form.value.scopes,
                    allowedIps,
                    expiresInDays: days ?? null,
                },
            })
            revealed.value = { client: res.client, secret: res.secret }
        }
        showForm.value = false
        await fetchClients()
    } catch (e: any) {
        useToaster('error', e?.data?.statusMessage || 'Gagal menyimpan')
    } finally {
        saving.value = false
    }
}

// ─── Actions ────────────────────────────────────────────────────────────
const reactivate = async (c: McpClient) => {
    try {
        await $fetch(`/api/admin/mcp/clients/${c.id}`, { method: 'PATCH', body: { status: 'active' } })
        useToaster('success', 'Klien diaktifkan kembali')
        fetchClients()
    } catch (e: any) {
        useToaster('error', e?.data?.statusMessage || 'Gagal')
    }
}

const runConfirmed = async () => {
    if (!confirmAction.value) return
    const { type, client } = confirmAction.value
    actionBusy.value = true
    try {
        if (type === 'rotate') {
            const res = await $fetch<any>(`/api/admin/mcp/clients/${client.id}/rotate`, { method: 'POST' })
            revealed.value = { client: res.client, secret: res.secret }
        } else if (type === 'revoke') {
            await $fetch(`/api/admin/mcp/clients/${client.id}`, { method: 'PATCH', body: { status: 'revoked' } })
            useToaster('success', 'Akses dicabut — semua sesi diputus')
        } else {
            await $fetch(`/api/admin/mcp/clients/${client.id}`, { method: 'DELETE' })
            useToaster('success', 'Klien dihapus')
        }
        confirmAction.value = null
        fetchClients()
    } catch (e: any) {
        useToaster('error', e?.data?.statusMessage || 'Gagal')
    } finally {
        actionBusy.value = false
    }
}

const confirmText = computed(() => {
    const c = confirmAction.value
    if (!c) return { title: '', body: '', cta: '' }
    if (c.type === 'rotate') return { title: 'Rotasi signing secret?', body: `Secret lama milik "${c.client.name}" langsung tidak berlaku dan semua sesi aktif diputus. Perbarui konfigurasi klien dengan secret baru.`, cta: 'Rotasi secret' }
    if (c.type === 'revoke') return { title: 'Cabut akses klien?', body: `"${c.client.name}" tidak bisa lagi terhubung. Anda bisa mengaktifkannya kembali nanti.`, cta: 'Cabut akses' }
    return { title: 'Hapus klien permanen?', body: `"${c.client.name}" beserta sesinya dihapus. Log audit tetap disimpan. Tindakan ini tidak bisa dibatalkan.`, cta: 'Hapus permanen' }
})

const actionLabel: Record<string, string> = {
    initialize: 'Initialize',
    'tools/call': 'Panggil tool',
    auth_failed: 'Auth gagal',
    client_created: 'Klien dibuat',
    client_updated: 'Klien diubah',
    client_revoked: 'Akses dicabut',
    client_reactivated: 'Diaktifkan',
    client_deleted: 'Klien dihapus',
    secret_rotated: 'Secret dirotasi',
}

const inputCls = 'w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors'
const btnGhost = 'flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/25 transition-colors'
const btnPrimary = 'flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono uppercase tracking-widest transition-colors disabled:opacity-50'
</script>

<template>
    <div class="p-6 space-y-8">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MODEL CONTEXT PROTOCOL</p>
                <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Koneksi MCP</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Setiap klien AI wajib menandatangani tiap request dengan HMAC-SHA256 memakai secret miliknya sendiri.
                </p>
            </div>
            <div class="flex gap-2">
                <button :class="btnGhost" @click="tab === 'logs' ? fetchLogs() : fetchClients()">
                    <RefreshCw class="w-3.5 h-3.5" :class="(isLoading || logsLoading) ? 'animate-spin' : ''" /> Refresh
                </button>
                <button :class="btnPrimary" @click="openCreate">
                    <Plus class="w-3.5 h-3.5" /> Klien baru
                </button>
            </div>
        </div>

        <!-- Endpoint -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-100 dark:border-white/6 bg-gray-50/60 dark:bg-white/2">
            <Plug class="w-4 h-4 text-indigo-500 shrink-0" />
            <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Endpoint</span>
            <code class="flex-1 text-sm text-gray-900 dark:text-white break-all">{{ endpoint || '…' }}</code>
            <button class="text-gray-400 hover:text-gray-900 dark:hover:text-white" @click="copy(endpoint, 'Endpoint disalin')"><Copy class="w-4 h-4" /></button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
            <div v-for="s in [
                { label: 'Total klien', value: stats.total, icon: Plug, color: 'text-indigo-500' },
                { label: 'Aktif', value: stats.active, icon: ShieldCheck, color: 'text-emerald-500' },
                { label: 'Dicabut', value: stats.revoked, icon: ShieldAlert, color: 'text-red-500' },
                { label: 'Kedaluwarsa', value: stats.expired, icon: Clock, color: 'text-yellow-500' },
            ]" :key="s.label" class="bg-white dark:bg-[#030308] p-5">
                <component :is="s.icon" :class="['w-4 h-4 mb-3', s.color]" />
                <p class="text-2xl font-black text-gray-900 dark:text-white">{{ isLoading ? '—' : s.value }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">{{ s.label }}</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-6 border-b border-gray-100 dark:border-white/6">
            <button v-for="t in [{ k: 'clients', l: 'Klien' }, { k: 'logs', l: 'Log audit' }]" :key="t.k"
                class="pb-3 -mb-px font-mono text-[11px] tracking-widest uppercase border-b-2 transition-colors"
                :class="tab === t.k ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                @click="switchTab(t.k as any)">{{ t.l }}</button>
        </div>

        <!-- Clients -->
        <div v-if="tab === 'clients'" class="border border-gray-100 dark:border-white/6 divide-y divide-gray-100 dark:divide-white/6">
            <template v-if="isLoading && !clients.length">
                <div v-for="n in 3" :key="n" class="p-5 animate-pulse space-y-2">
                    <div class="h-3 bg-gray-100 dark:bg-white/6 w-1/3 rounded"></div>
                    <div class="h-3 bg-gray-100 dark:bg-white/6 w-2/3 rounded"></div>
                </div>
            </template>
            <div v-else-if="!clients.length" class="p-10 text-center">
                <Plug class="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada klien MCP. Buat satu untuk mulai menghubungkan asisten AI.</p>
            </div>
            <div v-for="c in clients" :key="c.id" class="p-5 flex flex-col lg:flex-row lg:items-start gap-4">
                <div class="flex-1 min-w-0 space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                        <h3 class="font-bold text-gray-900 dark:text-white">{{ c.name }}</h3>
                        <span v-if="c.status === 'revoked'" class="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30">Dicabut</span>
                        <span v-else-if="isExpired(c)" class="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30">Kedaluwarsa</span>
                        <span v-else class="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">Aktif</span>
                    </div>
                    <p v-if="c.description" class="text-sm text-gray-500 dark:text-gray-400">{{ c.description }}</p>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <button class="font-mono hover:text-indigo-500 flex items-center gap-1" @click="copy(c.clientId, 'Client ID disalin')">{{ c.clientId }} <Copy class="w-3 h-3" /></button>
                        <span class="font-mono">secret {{ c.maskedSecret }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        <span v-for="s in c.scopes" :key="s" class="font-mono text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{{ s }}</span>
                        <span v-if="c.allowedIps.length" class="font-mono text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-white/6 text-gray-600 dark:text-gray-300">IP: {{ c.allowedIps.join(', ') }}</span>
                    </div>
                    <p class="text-[11px] text-gray-400">
                        Terakhir dipakai {{ fmt(c.lastUsedAt) }}<template v-if="c.lastUsedIp"> dari {{ c.lastUsedIp }}</template>
                        · Kedaluwarsa {{ c.expiresAt ? fmt(c.expiresAt) : 'tidak' }}
                        · Dibuat {{ fmt(c.createdAt) }}
                    </p>
                </div>
                <div class="flex flex-wrap gap-2 shrink-0">
                    <button :class="btnGhost" @click="openEdit(c)">Ubah</button>
                    <button :class="btnGhost" @click="confirmAction = { type: 'rotate', client: c }"><KeyRound class="w-3.5 h-3.5" /> Rotasi</button>
                    <button v-if="c.status === 'active'" :class="btnGhost" @click="confirmAction = { type: 'revoke', client: c }"><Ban class="w-3.5 h-3.5" /> Cabut</button>
                    <button v-else :class="btnGhost" @click="reactivate(c)"><CheckCircle2 class="w-3.5 h-3.5" /> Aktifkan</button>
                    <button :class="btnGhost + ' hover:!text-red-500 hover:!border-red-300'" @click="confirmAction = { type: 'delete', client: c }"><Trash2 class="w-3.5 h-3.5" /></button>
                </div>
            </div>
        </div>

        <!-- Logs -->
        <div v-else class="space-y-4">
            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer w-fit">
                <input v-model="logsFailedOnly" type="checkbox" class="accent-indigo-600" @change="logsPage = 1; fetchLogs()" />
                Hanya tampilkan yang gagal
            </label>
            <div class="border border-gray-100 dark:border-white/6 overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-white/2">
                        <tr class="text-left font-mono text-[10px] tracking-widest uppercase text-gray-400">
                            <th class="px-4 py-3">Waktu</th><th class="px-4 py-3">Klien</th><th class="px-4 py-3">Aksi</th>
                            <th class="px-4 py-3">Tool</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">IP</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/6">
                        <tr v-if="logsLoading"><td colspan="6" class="px-4 py-6 text-center text-gray-400">Memuat…</td></tr>
                        <tr v-else-if="!logs.length"><td colspan="6" class="px-4 py-6 text-center text-gray-400">Belum ada log.</td></tr>
                        <tr v-for="l in logs" :key="l.id" class="text-gray-700 dark:text-gray-300">
                            <td class="px-4 py-2.5 whitespace-nowrap text-xs">{{ fmt(l.createdAt) }}</td>
                            <td class="px-4 py-2.5 text-xs">{{ clientName(l.clientId) }}</td>
                            <td class="px-4 py-2.5 text-xs">{{ actionLabel[l.action] ?? l.action }}</td>
                            <td class="px-4 py-2.5 font-mono text-xs">{{ l.toolName ?? '—' }}</td>
                            <td class="px-4 py-2.5 text-xs">
                                <span v-if="l.success" class="text-emerald-600 dark:text-emerald-400">OK</span>
                                <span v-else class="text-red-600 dark:text-red-400 font-mono">{{ l.errorCode ?? 'gagal' }}</span>
                            </td>
                            <td class="px-4 py-2.5 font-mono text-xs">{{ l.ipAddress ?? '—' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex items-center justify-end gap-3 text-xs text-gray-500">
                <button :class="btnGhost" :disabled="logsPage <= 1" @click="logsPage--; fetchLogs()">Sebelumnya</button>
                <span>{{ logsPage }} / {{ logsTotalPages }}</span>
                <button :class="btnGhost" :disabled="logsPage >= logsTotalPages" @click="logsPage++; fetchLogs()">Berikutnya</button>
            </div>
        </div>

        <!-- Form modal -->
        <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showForm = false">
            <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 p-6 space-y-5">
                <div class="flex items-center justify-between">
                    <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ editing ? 'Ubah klien' : 'Klien MCP baru' }}</h2>
                    <button class="text-gray-400 hover:text-gray-900 dark:hover:text-white" @click="showForm = false"><X class="w-4 h-4" /></button>
                </div>
                <div class="space-y-1.5">
                    <label class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Nama</label>
                    <input v-model="form.name" :class="inputCls" placeholder="mis. Claude Desktop — laptop kantor" maxlength="80" />
                </div>
                <div class="space-y-1.5">
                    <label class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Deskripsi (opsional)</label>
                    <input v-model="form.description" :class="inputCls" maxlength="300" />
                </div>
                <div class="space-y-2">
                    <label class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Scope (hak akses)</label>
                    <label v-for="s in scopes" :key="s.key" class="flex items-start gap-3 p-3 border border-gray-100 dark:border-white/6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2">
                        <input type="checkbox" class="mt-1 accent-indigo-600" :checked="form.scopes.includes(s.key)" @change="toggleScope(s.key)" />
                        <span>
                            <span class="font-mono text-xs text-gray-900 dark:text-white">{{ s.key }}</span>
                            <span class="block text-xs text-gray-500 dark:text-gray-400">{{ s.description }}</span>
                            <span class="block font-mono text-[10px] text-gray-400 mt-0.5">{{ s.tools.join(', ') }}</span>
                        </span>
                    </label>
                </div>
                <div class="space-y-1.5">
                    <label class="font-mono text-[10px] tracking-widest uppercase text-gray-400">IP yang diizinkan (opsional)</label>
                    <textarea v-model="form.allowedIpsText" :class="inputCls" rows="2" placeholder="Kosongkan = semua IP. Satu per baris, mis. 203.0.113.10 atau 10.0.0.0/24" />
                </div>
                <div class="space-y-1.5">
                    <label class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                        Kedaluwarsa (hari){{ editing ? ' — kosongkan agar tidak diubah' : '' }}
                    </label>
                    <select v-model="form.expiresInDays" :class="inputCls">
                        <option v-if="editing" value="">Tidak diubah</option>
                        <option :value="30">30 hari</option>
                        <option :value="90">90 hari</option>
                        <option :value="180">180 hari</option>
                        <option :value="365">1 tahun</option>
                        <option :value="0">Tidak kedaluwarsa</option>
                    </select>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button :class="btnGhost" @click="showForm = false">Batal</button>
                    <button :class="btnPrimary" :disabled="saving || form.name.trim().length < 3 || !form.scopes.length" @click="submitForm">
                        {{ saving ? 'Menyimpan…' : editing ? 'Simpan' : 'Buat & tampilkan secret' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Secret reveal modal -->
        <div v-if="revealed" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 p-6 space-y-5">
                <div class="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30">
                    <AlertTriangle class="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                    <p class="text-sm text-yellow-800 dark:text-yellow-200">
                        Simpan signing secret ini sekarang. Secret <b>tidak akan ditampilkan lagi</b> — jika hilang, lakukan rotasi.
                    </p>
                </div>
                <div class="space-y-3">
                    <div>
                        <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400 mb-1">Client ID</p>
                        <div class="flex gap-2"><code class="flex-1 p-2.5 bg-gray-50 dark:bg-white/4 text-sm break-all">{{ revealed.client.clientId }}</code>
                            <button :class="btnGhost" @click="copy(revealed.client.clientId)"><Copy class="w-3.5 h-3.5" /></button></div>
                    </div>
                    <div>
                        <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400 mb-1">Signing secret</p>
                        <div class="flex gap-2"><code class="flex-1 p-2.5 bg-gray-50 dark:bg-white/4 text-sm break-all">{{ revealed.secret }}</code>
                            <button :class="btnGhost" @click="copy(revealed.secret, 'Secret disalin')"><Copy class="w-3.5 h-3.5" /></button></div>
                    </div>
                    <div>
                        <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400 mb-1">Konfigurasi Claude Desktop / klien MCP (via scripts/mcp-signer.mjs)</p>
                        <div class="relative">
                            <pre class="p-3 bg-gray-950 text-gray-100 text-xs overflow-x-auto">{{ bridgeConfig }}</pre>
                            <button class="absolute top-2 right-2 text-gray-400 hover:text-white" @click="copy(bridgeConfig, 'Konfigurasi disalin')"><Copy class="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button :class="btnPrimary" @click="revealed = null">Saya sudah menyimpannya</button>
                </div>
            </div>
        </div>

        <!-- Confirm modal -->
        <div v-if="confirmAction" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="confirmAction = null">
            <div class="w-full max-w-md bg-white dark:bg-[#0a0a12] border border-gray-200 dark:border-white/10 p-6 space-y-4">
                <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ confirmText.title }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ confirmText.body }}</p>
                <div class="flex justify-end gap-2">
                    <button :class="btnGhost" @click="confirmAction = null">Batal</button>
                    <button class="flex items-center gap-2 px-4 py-2.5 text-white text-xs font-mono uppercase tracking-widest transition-colors disabled:opacity-50"
                        :class="confirmAction.type === 'rotate' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'"
                        :disabled="actionBusy" @click="runConfirmed">{{ actionBusy ? 'Memproses…' : confirmText.cta }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
