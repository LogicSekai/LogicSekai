<script setup lang="ts">
import {
  CreditCard, ShieldCheck, Eye, EyeOff, Save, Trash2, RotateCcw,
  AlertTriangle, CheckCircle2, Clock, Info, ChevronDown,
  KeyRound, Loader2, ExternalLink, Link2, RefreshCw, Copy, Check
} from 'lucide-vue-next'

definePageMeta({ layout: 'creator', middleware: 'creator' })
useHead({ title: 'Payment Gateway — Logic Sekai' })

// ─── Types ───────────────────────────────────────────────────────────────────
type Provider = 'midtrans' | 'tripay'

interface PaymentAccount {
  id: string
  provider: Provider
  mode: 'sandbox' | 'live'
  hasServerKey: boolean
  maskedServerKey: string | null
  hasClientKey: boolean
  maskedClientKey: string | null
  hasExtraKey: boolean
  maskedExtraKey: string | null
  keyVersion: number
  needsRotation: boolean
  isActive: boolean
  callbackToken: string | null
  createdAt: string
  updatedAt: string
}
interface AuditLog {
  id: string
  action: string
  provider: string | null
  ipAddress: string | null
  metadata: string | null
  createdAt: string
}

// ─── Provider config ─────────────────────────────────────────────────────────
const PROVIDERS: Record<Provider, {
  label: string
  color: string
  website: string
  dashboardUrl: string
  serverKeyLabel: string
  serverKeyPlaceholder: string
  clientKeyLabel: string
  clientKeyNote: string
  clientKeyPlaceholder: string
  extraKeyLabel: string
  extraKeyNote: string
  extraKeyPlaceholder: string
  hasExtraKey: boolean
  helpSteps: string[]
}> = {
  midtrans: {
    label: 'Midtrans',
    color: '#003580',
    website: 'https://midtrans.com',
    dashboardUrl: 'https://dashboard.midtrans.com',
    serverKeyLabel: 'Server Key',
    serverKeyPlaceholder: 'SB-Mid-server-xxxxxxxxxxxxxxxx',
    clientKeyLabel: 'Client Key',
    clientKeyNote: 'untuk Snap.js (wajib)',
    clientKeyPlaceholder: 'SB-Mid-client-xxxxxxxxxxxxxxxx',
    extraKeyLabel: '',
    extraKeyNote: '',
    extraKeyPlaceholder: '',
    hasExtraKey: false,
    helpSteps: [
      '1. Login ke <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">dashboard.midtrans.com</a>',
      '2. Buka <strong>Settings → Access Keys</strong>',
      '3. Pilih environment (Sandbox untuk testing, Production untuk live)',
      '4. Salin <strong>Server Key</strong> dan <strong>Client Key</strong>',
    ],
  },
  tripay: {
    label: 'Tripay',
    color: '#0e7c3a',
    website: 'https://tripay.co.id',
    dashboardUrl: 'https://tripay.co.id/member',
    serverKeyLabel: 'API Key',
    serverKeyPlaceholder: 'DEV-xxxxxxxxxxxxxxxxxxxxxxxx',
    clientKeyLabel: 'Private Key',
    clientKeyNote: 'untuk tanda tangan signature',
    clientKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    extraKeyLabel: 'Merchant Code',
    extraKeyNote: 'wajib',
    extraKeyPlaceholder: 'T12345',
    hasExtraKey: true,
    helpSteps: [
      '1. Login ke <a href="https://tripay.co.id/member" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">tripay.co.id/member</a>',
      '2. Buka <strong>Merchant → Detail Merchant</strong>',
      '3. Salin <strong>API Key</strong>, <strong>Private Key</strong>, dan <strong>Kode Merchant</strong>',
      '4. Gunakan key Sandbox untuk testing, key Produksi untuk live',
    ],
  },
}

// ─── Data ────────────────────────────────────────────────────────────────────
const { data, pending, refresh } = await useFetch<{ accounts: PaymentAccount[]; auditLogs: AuditLog[] }>(
  '/api/creator/payment-gateway'
)
const accountOf = (p: Provider) => computed(() => data.value?.accounts.find((a) => a.provider === p) ?? null)
const midtrans = accountOf('midtrans')
const tripay   = accountOf('tripay')
const auditLogs = computed(() => data.value?.auditLogs ?? [])

function acctFor(p: Provider) {
  return p === 'midtrans' ? midtrans.value : tripay.value
}

// ─── Form state (per-provider) ────────────────────────────────────────────────
const activeProvider = ref<Provider | null>(null)
const forms = reactive<Record<Provider, {
  mode: 'sandbox' | 'live'; serverKey: string; clientKey: string; extraKey: string
}>>({
  midtrans: { mode: 'sandbox', serverKey: '', clientKey: '', extraKey: '' },
  tripay:   { mode: 'sandbox', serverKey: '', clientKey: '', extraKey: '' },
})
const showKey = reactive<Record<Provider, { server: boolean; client: boolean; extra: boolean }>>({
  midtrans: { server: false, client: false, extra: false },
  tripay:   { server: false, client: false, extra: false },
})

// Sync mode from existing account when form opens
watch([midtrans, tripay, activeProvider], () => {
  if (activeProvider.value === 'midtrans' && midtrans.value) forms.midtrans.mode = midtrans.value.mode
  if (activeProvider.value === 'tripay'   && tripay.value)   forms.tripay.mode   = tripay.value.mode
})

function openForm(p: Provider) {
  activeProvider.value = activeProvider.value === p ? null : p
}

// ─── UI state ────────────────────────────────────────────────────────────────
const saving          = ref<Provider | null>(null)
const deleting        = ref<Provider | null>(null)
const toggling        = ref<Provider | null>(null)
const regenerating    = ref<Provider | null>(null)
const rotating        = ref(false)
const toast           = ref<{ type: 'success' | 'error'; msg: string } | null>(null)
const showDeleteFor   = ref<Provider | null>(null)
const showRotateConfirm = ref(false)
const copied          = ref<Provider | null>(null)
const origin          = import.meta.client ? window.location.origin : ''

function showToast(type: 'success' | 'error', msg: string) {
  toast.value = { type, msg }
  setTimeout(() => { toast.value = null }, 5000)
}

function callbackUrl(acct: PaymentAccount | null) {
  if (!acct?.callbackToken) return null
  return `${origin}/api/payments/callback/${acct.callbackToken}`
}

async function copyUrl(p: Provider, url: string) {
  try {
    await navigator.clipboard.writeText(url)
    copied.value = p
    setTimeout(() => { copied.value = null }, 2000)
  } catch { /* ignore */ }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const actionLabels: Record<string, string> = {
  created:           'Konfigurasi dibuat',
  updated:           'Konfigurasi diperbarui',
  deleted:           'Konfigurasi dihapus',
  key_rotated:       'Enkripsi key dirotasi',
  mode_changed:      'Mode diubah',
  activated:         'Gateway diaktifkan',
  deactivated:       'Gateway dinonaktifkan',
  token_regenerated: 'Callback URL diperbarui',
}
const actionColors: Record<string, string> = {
  created:           'text-emerald-600 dark:text-emerald-400',
  updated:           'text-blue-600 dark:text-blue-400',
  deleted:           'text-red-500 dark:text-red-400',
  key_rotated:       'text-purple-600 dark:text-purple-400',
  mode_changed:      'text-amber-600 dark:text-amber-400',
  activated:         'text-emerald-600 dark:text-emerald-400',
  deactivated:       'text-gray-500 dark:text-gray-400',
  token_regenerated: 'text-cyan-600 dark:text-cyan-400',
}

function formatDate(d: string | number) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Actions ─────────────────────────────────────────────────────────────────
async function save(p: Provider) {
  const form = forms[p]
  const existing = p === 'midtrans' ? midtrans.value : tripay.value
  const cfg = PROVIDERS[p]

  if (!existing && !form.serverKey.trim()) {
    showToast('error', `${cfg.serverKeyLabel} wajib diisi saat membuat konfigurasi baru.`)
    return
  }
  if (cfg.hasExtraKey && !existing && !form.extraKey.trim()) {
    showToast('error', `${cfg.extraKeyLabel} wajib diisi saat membuat konfigurasi baru.`)
    return
  }

  saving.value = p
  try {
    await $fetch('/api/creator/payment-gateway', {
      method: 'POST',
      body: {
        provider:  p,
        mode:      form.mode,
        serverKey: form.serverKey.trim() || undefined,
        clientKey: form.clientKey.trim() || undefined,
        extraKey:  form.extraKey.trim()  || undefined,
      },
    })
    forms[p] = { mode: form.mode, serverKey: '', clientKey: '', extraKey: '' }
    showKey[p] = { server: false, client: false, extra: false }
    activeProvider.value = null
    showToast('success', 'Konfigurasi berhasil disimpan.')
    await refresh()
  } catch (err: any) {
    showToast('error', err?.data?.statusMessage ?? 'Gagal menyimpan konfigurasi.')
  } finally {
    saving.value = null
  }
}

async function toggleActive(p: Provider) {
  const acct = acctFor(p)
  if (!acct) return
  if (!acct.isActive && !acct.hasServerKey) {
    showToast('error', 'Simpan API key terlebih dahulu sebelum mengaktifkan gateway.')
    return
  }
  toggling.value = p
  try {
    if (!acct.isActive) {
      // Deactivate the other provider first — only one can be active at a time
      const otherKey: Provider = p === 'midtrans' ? 'tripay' : 'midtrans'
      const other = acctFor(otherKey)
      if (other?.isActive) {
        await $fetch(`/api/creator/payment-gateway/${other.id}`, {
          method: 'PATCH',
          body: { isActive: false },
        })
      }
    }
    await $fetch(`/api/creator/payment-gateway/${acct.id}`, {
      method: 'PATCH',
      body: { isActive: !acct.isActive },
    })
    await refresh()
  } catch (err: any) {
    showToast('error', err?.data?.statusMessage ?? 'Gagal mengubah status.')
  } finally {
    toggling.value = null
  }
}

async function deleteAccount(p: Provider) {
  const acct = p === 'midtrans' ? midtrans.value : tripay.value
  if (!acct) return
  deleting.value = p
  try {
    await $fetch(`/api/creator/payment-gateway/${acct.id}`, { method: 'DELETE' })
    showDeleteFor.value = null
    forms[p] = { mode: 'sandbox', serverKey: '', clientKey: '', extraKey: '' }
    await refresh()
  } catch (err: any) {
    showToast('error', err?.data?.statusMessage ?? 'Gagal menghapus konfigurasi.')
  } finally {
    deleting.value = null
  }
}

async function regenerateCallbackToken(p: Provider) {
  const acct = p === 'midtrans' ? midtrans.value : tripay.value
  if (!acct) return
  regenerating.value = p
  try {
    await $fetch(`/api/creator/payment-gateway/${acct.id}`, {
      method: 'PATCH',
      body: { regenerateToken: true },
    })
    showToast('success', 'Callback URL baru berhasil dibuat. Perbarui pengaturan di dashboard payment gateway.')
    await refresh()
  } catch (err: any) {
    showToast('error', err?.data?.statusMessage ?? 'Gagal memperbarui callback URL.')
  } finally {
    regenerating.value = null
  }
}

async function rotateKey() {
  rotating.value = true
  try {
    const res = await $fetch<{ success: boolean; rotated: number }>(
      '/api/creator/payment-gateway/rotate-key',
      { method: 'POST' }
    )
    showRotateConfirm.value = false
    showToast('success', res.rotated > 0
      ? 'Enkripsi key berhasil dirotasi ke versi terbaru.'
      : 'Key sudah menggunakan versi enkripsi terbaru.')
    if (res.rotated > 0) await refresh()
  } catch (err: any) {
    showToast('error', err?.data?.statusMessage ?? 'Gagal merotasi enkripsi key.')
  } finally {
    rotating.value = false
  }
}

const anyNeedsRotation = computed(() =>
  [midtrans.value, tripay.value].some(a => a?.needsRotation)
)
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// PENGATURAN</p>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Payment Gateway</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Konfigurasi payment gateway untuk menerima pembayaran dari pelanggan
      </p>
    </div>

    <!-- Security notice -->
    <div class="flex items-start gap-3 px-4 py-3 border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10">
      <ShieldCheck class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <p class="text-xs text-blue-700 dark:text-blue-300">
        Semua API key <span class="font-mono font-semibold">dienkripsi</span> sebelum disimpan.
        Dashboard hanya menampilkan 4 karakter terakhir. Callback URL bersifat unik dan tidak dapat ditebak.
      </p>
    </div>

    <!-- Toast -->
    <Transition enter-from-class="opacity-0 translate-y-1" leave-to-class="opacity-0 translate-y-1" enter-active-class="transition duration-200" leave-active-class="transition duration-200">
      <div v-if="toast" :class="['flex items-center gap-3 px-4 py-3 border', toast.type === 'success'
          ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20']">
        <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4 text-emerald-500 shrink-0" />
        <AlertTriangle v-else class="w-4 h-4 text-red-500 shrink-0" />
        <p :class="['text-sm', toast.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400']">{{ toast.msg }}</p>
        <button @click="toast = null" class="ml-auto text-gray-400 hover:text-gray-600 text-xs">âœ•</button>
      </div>
    </Transition>

    <!-- Rotation warning (global) -->
    <div v-if="anyNeedsRotation && !pending" class="flex items-start gap-3 px-4 py-3 border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10">
      <AlertTriangle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="text-sm font-medium text-amber-700 dark:text-amber-400">Rotasi enkripsi tersedia</p>
        <p class="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Versi enkripsi key baru tersedia. Rotasi untuk memperbarui semua key ke versi terbaru.</p>
      </div>
      <button @click="showRotateConfirm = true"
        class="flex items-center gap-1.5 px-3 py-1.5 border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-mono text-[10px] uppercase tracking-widest transition-colors shrink-0">
        <KeyRound class="w-3 h-3" />
        Rotasi
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>

    <template v-else>

      <!-- ── PROVIDER CARDS ──────────────────────────────────────────── -->
      <div class="grid gap-4 sm:grid-cols-2">
        <template v-for="providerKey in (['midtrans', 'tripay'] as Provider[])" :key="providerKey">
          <div class="border border-gray-100 dark:border-white/6">
            <!-- Card header -->
            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: PROVIDERS[providerKey].color }">
                  <CreditCard class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ PROVIDERS[providerKey].label }}</p>
                  <a :href="PROVIDERS[providerKey].website" target="_blank" rel="noopener"
                    class="inline-flex items-center gap-1 font-mono text-[10px] text-gray-400 hover:text-indigo-500 transition-colors">
                    {{ PROVIDERS[providerKey].website.replace('https://', '') }}
                    <ExternalLink class="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <!-- Status badge + toggle -->
              <template v-if="(providerKey === 'midtrans' ? midtrans : tripay)">
                <div class="flex items-center gap-2">
                  <span :class="['font-mono text-[10px] uppercase px-2 py-0.5 border',
                    (providerKey === 'midtrans' ? midtrans : tripay)?.isActive
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                      : 'text-gray-400 bg-gray-50 border-gray-200 dark:bg-white/4 dark:border-white/10']">
                    {{ (providerKey === 'midtrans' ? midtrans : tripay)?.isActive ? 'Aktif' : 'Nonaktif' }}
                  </span>
                  <button @click="toggleActive(providerKey)" :disabled="toggling === providerKey"
                    :class="['relative inline-flex h-5 w-9 items-center transition-colors focus:outline-none disabled:opacity-50',
                      (providerKey === 'midtrans' ? midtrans : tripay)?.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20']">
                    <span :class="['inline-block h-3.5 w-3.5 bg-white transition-transform',
                      (providerKey === 'midtrans' ? midtrans : tripay)?.isActive ? 'translate-x-4.5' : 'translate-x-0.5']" />
                  </button>
                </div>
              </template>
              <template v-else>
                <span class="font-mono text-[10px] text-gray-400">Belum dikonfigurasi</span>
              </template>
            </div>

            <!-- Card body -->
            <div class="p-5 space-y-4">
              <!-- Masked keys summary -->
              <template v-if="(providerKey === 'midtrans' ? midtrans : tripay)">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="font-mono text-[10px] text-gray-400 mb-0.5">Mode</p>
                    <span :class="['font-mono text-[10px] uppercase px-1.5 py-0.5 border',
                      (providerKey === 'midtrans' ? midtrans : tripay)?.mode === 'live'
                        ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                        : 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400']">
                      {{ (providerKey === 'midtrans' ? midtrans : tripay)?.mode === 'live' ? '⚠  Live' : 'Sandbox' }}
                    </span>
                  </div>
                  <div>
                    <p class="font-mono text-[10px] text-gray-400 mb-0.5">{{ PROVIDERS[providerKey].serverKeyLabel }}</p>
                    <p class="font-mono text-[10px] text-gray-600 dark:text-gray-300 truncate">
                      {{ (providerKey === 'midtrans' ? midtrans : tripay)?.maskedServerKey ?? '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="font-mono text-[10px] text-gray-400 mb-0.5">{{ PROVIDERS[providerKey].clientKeyLabel }}</p>
                    <p class="font-mono text-[10px] text-gray-600 dark:text-gray-300 truncate">
                      {{ (providerKey === 'midtrans' ? midtrans : tripay)?.maskedClientKey ?? '—' }}
                    </p>
                  </div>
                  <div v-if="PROVIDERS[providerKey].hasExtraKey">
                    <p class="font-mono text-[10px] text-gray-400 mb-0.5">{{ PROVIDERS[providerKey].extraKeyLabel }}</p>
                    <p class="font-mono text-[10px] text-gray-600 dark:text-gray-300 truncate">
                      {{ (providerKey === 'midtrans' ? midtrans : tripay)?.maskedExtraKey ?? '—' }}
                    </p>
                  </div>
                </div>

                <!-- Callback URL -->
                <div class="p-3 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/6 space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                      <Link2 class="w-3 h-3 text-indigo-500 shrink-0" />
                      <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500">Callback URL</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button
                        v-if="callbackUrl(providerKey === 'midtrans' ? midtrans : tripay)"
                        @click="copyUrl(providerKey, callbackUrl(providerKey === 'midtrans' ? midtrans : tripay)!)"
                        class="flex items-center gap-1 font-mono text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors">
                        <Check v-if="copied === providerKey" class="w-3 h-3 text-emerald-500" />
                        <Copy v-else class="w-3 h-3" />
                        {{ copied === providerKey ? 'Disalin' : 'Salin' }}
                      </button>
                      <button @click="regenerateCallbackToken(providerKey)"
                        :disabled="regenerating === providerKey"
                        class="flex items-center gap-1 font-mono text-[10px] text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                        title="Buat URL baru (URL lama tidak akan berfungsi)">
                        <Loader2 v-if="regenerating === providerKey" class="w-3 h-3 animate-spin" />
                        <RefreshCw v-else class="w-3 h-3" />
                        Perbarui
                      </button>
                    </div>
                  </div>
                  <template v-if="callbackUrl(providerKey === 'midtrans' ? midtrans : tripay)">
                    <p class="font-mono text-[10px] text-gray-500 dark:text-gray-400 break-all leading-relaxed">
                      {{ callbackUrl(providerKey === 'midtrans' ? midtrans : tripay) }}
                    </p>
                    <p class="text-[10px] text-gray-400">
                      Daftarkan URL ini di dashboard {{ PROVIDERS[providerKey].label }} sebagai Notification/Callback URL.
                    </p>
                  </template>
                  <p v-else class="text-[10px] text-gray-400 italic">Simpan konfigurasi untuk mendapatkan URL</p>
                </div>
              </template>

              <!-- Edit / Configure button -->
              <div class="flex items-center gap-2">
                <button @click="openForm(providerKey)"
                  :class="['flex items-center gap-2 px-4 py-2 border font-mono text-[10px] uppercase tracking-widest transition-colors',
                    activeProvider === providerKey
                      ? 'border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/30']">
                  <CreditCard class="w-3.5 h-3.5" />
                  {{ (providerKey === 'midtrans' ? midtrans : tripay) ? 'Edit' : 'Konfigurasi' }}
                </button>
                <button v-if="(providerKey === 'midtrans' ? midtrans : tripay)"
                  @click="showDeleteFor = providerKey"
                  class="flex items-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-900 text-red-400 hover:text-red-600 hover:border-red-400 font-mono text-[10px] uppercase tracking-widest transition-colors ml-auto">
                  <Trash2 class="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ── INLINE FORM ─────────────────────────────────────────────── -->
      <Transition
        enter-from-class="opacity-0 -translate-y-2"
        leave-to-class="opacity-0 -translate-y-2"
        enter-active-class="transition duration-150"
        leave-active-class="transition duration-150">
        <div v-if="activeProvider" class="border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 space-y-5">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">
            // {{ (activeProvider === 'midtrans' ? midtrans : tripay) ? 'PERBARUI' : 'TAMBAH' }} {{ PROVIDERS[activeProvider].label.toUpperCase() }}
          </p>

          <!-- Mode -->
          <div>
            <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Mode</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="forms[activeProvider].mode" type="radio" value="sandbox" class="accent-indigo-600" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Sandbox</span>
                <span class="font-mono text-[9px] text-gray-400">(testing)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="forms[activeProvider].mode" type="radio" value="live" class="accent-red-600" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Live</span>
                <span class="font-mono text-[9px] text-red-400">(production)</span>
              </label>
            </div>
            <p v-if="forms[activeProvider].mode === 'live'" class="mt-1.5 text-xs text-red-500 dark:text-red-400">
              ⚠  Mode Live akan memproses transaksi nyata. Pastikan key sudah benar.
            </p>
          </div>

          <!-- Server Key -->
          <div>
            <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              {{ PROVIDERS[activeProvider].serverKeyLabel }}
              <span v-if="(activeProvider === 'midtrans' ? midtrans : tripay)" class="normal-case tracking-normal ml-1 text-gray-400">(kosongkan jika tidak diubah)</span>
              <span v-else class="text-red-400 ml-0.5">*</span>
            </label>
            <div class="relative">
              <input v-model="forms[activeProvider].serverKey"
                :type="showKey[activeProvider].server ? 'text' : 'password'"
                :placeholder="(activeProvider === 'midtrans' ? midtrans : tripay)
                  ? ((activeProvider === 'midtrans' ? midtrans : tripay)?.maskedServerKey ?? '••••••••••••')
                  : PROVIDERS[activeProvider].serverKeyPlaceholder"
                autocomplete="off" spellcheck="false"
                class="w-full pr-10 px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" />
              <button type="button" @click="showKey[activeProvider].server = !showKey[activeProvider].server"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Eye v-if="!showKey[activeProvider].server" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Client Key -->
          <div>
            <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              {{ PROVIDERS[activeProvider].clientKeyLabel }}
              <span class="normal-case tracking-normal ml-1 text-gray-400">{{ PROVIDERS[activeProvider].clientKeyNote }}</span>
            </label>
            <div class="relative">
              <input v-model="forms[activeProvider].clientKey"
                :type="showKey[activeProvider].client ? 'text' : 'password'"
                :placeholder="(activeProvider === 'midtrans' ? midtrans : tripay)
                  ? ((activeProvider === 'midtrans' ? midtrans : tripay)?.maskedClientKey ?? '••••••••••••')
                  : PROVIDERS[activeProvider].clientKeyPlaceholder"
                autocomplete="off" spellcheck="false"
                class="w-full pr-10 px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" />
              <button type="button" @click="showKey[activeProvider].client = !showKey[activeProvider].client"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Eye v-if="!showKey[activeProvider].client" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Extra Key (Tripay Merchant Code etc.) -->
          <div v-if="PROVIDERS[activeProvider].hasExtraKey">
            <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              {{ PROVIDERS[activeProvider].extraKeyLabel }}
              <span v-if="(activeProvider === 'midtrans' ? midtrans : tripay)" class="normal-case tracking-normal ml-1 text-gray-400">(kosongkan jika tidak diubah)</span>
              <span v-else class="text-red-400 ml-0.5">*</span>
            </label>
            <div class="relative">
              <input v-model="forms[activeProvider].extraKey"
                :type="showKey[activeProvider].extra ? 'text' : 'password'"
                :placeholder="(activeProvider === 'midtrans' ? midtrans : tripay)
                  ? ((activeProvider === 'midtrans' ? midtrans : tripay)?.maskedExtraKey ?? '••••••••••••')
                  : PROVIDERS[activeProvider].extraKeyPlaceholder"
                autocomplete="off" spellcheck="false"
                class="w-full pr-10 px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" />
              <button type="button" @click="showKey[activeProvider].extra = !showKey[activeProvider].extra"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Eye v-if="!showKey[activeProvider].extra" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button @click="save(activeProvider)" :disabled="saving === activeProvider"
              class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
              <Loader2 v-if="saving === activeProvider" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              {{ saving === activeProvider ? 'Menyimpan...' : 'Simpan' }}
            </button>
            <button @click="activeProvider = null"
              class="px-4 py-2.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors">
              Batal
            </button>
          </div>

          <!-- Help -->
          <details class="group">
            <summary class="flex items-center gap-2 cursor-pointer list-none font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 select-none">
              <Info class="w-3.5 h-3.5" />
              Cara mendapatkan API key {{ PROVIDERS[activeProvider].label }}
              <ChevronDown class="w-3 h-3 transition-transform group-open:rotate-180 ml-auto" />
            </summary>
            <div class="mt-3 px-4 py-3 bg-white dark:bg-white/2 border border-gray-100 dark:border-white/6 text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <p v-for="step in PROVIDERS[activeProvider].helpSteps" :key="step" v-html="step" />
              <p class="text-amber-600 dark:text-amber-400">⚠  Jangan pernah bagikan Server Key / Private Key ke siapapun atau expose ke frontend.</p>
            </div>
          </details>
        </div>
      </Transition>

      <!-- ── AUDIT LOG ──────────────────────────────────────────────────── -->
      <div v-if="auditLogs.length" class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-2">
          <Clock class="w-3.5 h-3.5 text-indigo-600" />
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// RIWAYAT AKTIVITAS</p>
          <span class="ml-auto font-mono text-[10px] text-gray-400">{{ auditLogs.length }} entri</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-100 dark:border-white/6">
                <th class="px-6 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">Waktu</th>
                <th class="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">Aksi</th>
                <th class="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">Provider</th>
                <th class="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-white/4">
              <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                <td class="px-6 py-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                <td class="px-4 py-3">
                  <span :class="['font-mono text-[10px] uppercase', actionColors[log.action] ?? 'text-gray-500']">
                    {{ actionLabels[log.action] ?? log.action }}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono text-[10px] text-gray-500 capitalize">{{ log.provider ?? '—' }}</td>
                <td class="px-4 py-3 font-mono text-[10px] text-gray-400">{{ log.ipAddress ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <!-- ── DELETE CONFIRM MODAL ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showDeleteFor" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="showDeleteFor = null">
        <div class="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/8 w-full max-w-sm p-6 space-y-4">
          <div class="flex items-center gap-3">
            <AlertTriangle class="w-5 h-5 text-red-500 shrink-0" />
            <h3 class="font-bold text-gray-900 dark:text-white">Hapus Konfigurasi {{ PROVIDERS[showDeleteFor].label }}?</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Semua key yang tersimpan akan dihapus secara permanen dan callback URL akan tidak valid. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div class="flex gap-3 pt-1">
            <button @click="deleteAccount(showDeleteFor)" :disabled="deleting === showDeleteFor"
              class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
              <Loader2 v-if="deleting === showDeleteFor" class="w-3.5 h-3.5 animate-spin" />
              <Trash2 v-else class="w-3.5 h-3.5" />
              {{ deleting === showDeleteFor ? 'Menghapus...' : 'Hapus' }}
            </button>
            <button @click="showDeleteFor = null"
              class="px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors">
              Batal
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── ROTATE KEY CONFIRM MODAL ──────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showRotateConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="showRotateConfirm = false">
        <div class="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/8 w-full max-w-sm p-6 space-y-4">
          <div class="flex items-center gap-3">
            <KeyRound class="w-5 h-5 text-purple-600 shrink-0" />
            <h3 class="font-bold text-gray-900 dark:text-white">Rotasi Enkripsi Key?</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Key akan di-dekripsi dengan versi lama lalu di-enkripsi ulang dengan versi terbaru.
            Proses ini aman dan tidak mengubah API key payment gateway kamu.
          </p>
          <div class="flex gap-3 pt-1">
            <button @click="rotateKey" :disabled="rotating"
              class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
              <Loader2 v-if="rotating" class="w-3.5 h-3.5 animate-spin" />
              <RotateCcw v-else class="w-3.5 h-3.5" />
              {{ rotating ? 'Merotasi...' : 'Rotasi Sekarang' }}
            </button>
            <button @click="showRotateConfirm = false"
              class="px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors">
              Batal
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
