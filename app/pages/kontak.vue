<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
    layout: 'default'
})

useHead({
    title: 'Kontak — Logic Sekai',
    meta: [
        {
            name: 'description',
            content: 'Hubungi Logic Sekai untuk pertanyaan, kerjasama, atau dukungan. Kami siap membantu Anda.'
        }
    ]
})

const formData = ref({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general',
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref(false)

const contactTypes = [
    { id: 'general', label: 'UMUM' },
    { id: 'creator', label: 'KREATOR' },
    { id: 'buyer', label: 'PEMBELI' },
    { id: 'business', label: 'BISNIS' },
]

const contactChannels = [
    {
        label: 'Email',
        value: 'hello@logicsekai.com',
        href: 'mailto:hello@logicsekai.com',
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        note: 'Respon dalam 24 jam',
    },
    {
        label: 'Instagram',
        value: '@logicsekai',
        href: 'https://instagram.com/logicsekai',
        icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z',
        note: 'DM terbuka',
    },
    {
        label: 'Telegram',
        value: '@logicsekai',
        href: 'https://t.me/logicsekai',
        icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
        note: 'Respon cepat',
    },
]

const faqs = [
    {
        q: 'Bagaimana cara bergabung sebagai kreator?',
        a: 'Daftar akun, lengkapi profil kreator Anda, lalu mulai unggah produk digital. Proses verifikasi membutuhkan 1–2 hari kerja.',
    },
    {
        q: 'Metode pembayaran apa yang didukung?',
        a: 'Kami mendukung berbagai metode pembayaran lokal termasuk transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit.',
    },
    {
        q: 'Berapa komisi yang dikenakan kepada kreator?',
        a: 'Logic Sekai mengenakan komisi yang transparan dan kompetitif. Untuk detail lengkap silakan cek halaman kebijakan kreator.',
    },
    {
        q: 'Bagaimana jika produk yang dibeli tidak sesuai deskripsi?',
        a: 'Hubungi kami melalui form ini atau email. Kami memiliki kebijakan dispute yang melindungi pembeli dan kreator secara adil.',
    },
]

const openFaq = ref<number | null>(null)

const toggleFaq = (index: number) => {
    openFaq.value = openFaq.value === index ? null : index
}

const handleSubmit = async () => {
    isSubmitting.value = true
    submitError.value = false
    try {
        await $fetch('/api/contact', {
            method: 'POST',
            body: {
                name: formData.value.name.trim(),
                email: formData.value.email.trim(),
                subject: formData.value.subject.trim(),
                message: formData.value.message.trim(),
                type: formData.value.type,
            },
        })
        submitSuccess.value = true
        formData.value = { name: '', email: '', subject: '', message: '', type: 'general' }
        setTimeout(() => { submitSuccess.value = false }, 5000)
    } catch {
        submitError.value = true
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- Page Header -->
        <div class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-4">// HUBUNGI KAMI</p>
                <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
                    KONTAK &<br class="hidden lg:block" />
                    <span class="text-gray-300 dark:text-white/20">DUKUNGAN</span>
                </h1>
                <p class="mt-4 text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                    Ada pertanyaan, ingin berkolaborasi, atau butuh bantuan? Kami siap mendengarkan dan merespons secepat mungkin.
                </p>
            </div>
        </div>

        <!-- Main Grid: Contact Info + Form -->
        <div class="container mx-auto px-6 lg:px-10">
            <div class="grid lg:grid-cols-2 gap-0 border-b border-gray-100 dark:border-white/6">

                <!-- Left: Contact channels + FAQ -->
                <div class="py-12 lg:py-16 lg:pr-12 lg:border-r border-gray-100 dark:border-white/6 space-y-12">

                    <!-- Contact channels -->
                    <div>
                        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-6">// SALURAN KONTAK</p>
                        <div class="space-y-4">
                            <a
                                v-for="channel in contactChannels"
                                :key="channel.label"
                                :href="channel.href"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="group flex items-center gap-4 p-4 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-colors"
                            >
                                <div class="w-9 h-9 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-indigo-400 dark:group-hover:border-indigo-500/60 transition-colors">
                                    <svg class="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="channel.icon" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-0.5">{{ channel.label }}</p>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ channel.value }}</p>
                                </div>
                                <span class="font-mono text-[10px] text-gray-400 shrink-0">{{ channel.note }}</span>
                            </a>
                        </div>
                    </div>

                    <!-- Office hours -->
                    <div>
                        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-4">// JAM OPERASIONAL</p>
                        <div class="space-y-2 border border-gray-100 dark:border-white/6 p-4">
                            <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/6">
                                <span class="text-sm text-gray-500 dark:text-gray-400">Senin – Jumat</span>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">09:00 – 18:00 WIB</span>
                            </div>
                            <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/6">
                                <span class="text-sm text-gray-500 dark:text-gray-400">Sabtu</span>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">10:00 – 15:00 WIB</span>
                            </div>
                            <div class="flex justify-between items-center py-1.5">
                                <span class="text-sm text-gray-500 dark:text-gray-400">Minggu</span>
                                <span class="font-mono text-sm text-gray-400">Libur</span>
                            </div>
                        </div>
                        <p class="mt-3 text-xs text-gray-400">Email & Telegram direspon di luar jam kerja jika memungkinkan.</p>
                    </div>

                    <!-- FAQ -->
                    <div>
                        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-4">// PERTANYAAN UMUM</p>
                        <div class="divide-y divide-gray-100 dark:divide-white/6 border border-gray-100 dark:border-white/6">
                            <div v-for="(faq, index) in faqs" :key="index">
                                <button
                                    class="w-full flex items-center justify-between px-4 py-4 text-left gap-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                                    @click="toggleFaq(index)"
                                >
                                    <span class="text-sm font-bold text-gray-900 dark:text-white">{{ faq.q }}</span>
                                    <svg
                                        class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
                                        :class="openFaq === index ? 'rotate-45' : ''"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <Transition
                                    enter-active-class="transition-all duration-200 ease-out"
                                    enter-from-class="opacity-0 max-h-0"
                                    enter-to-class="opacity-100 max-h-40"
                                    leave-active-class="transition-all duration-150 ease-in"
                                    leave-from-class="opacity-100 max-h-40"
                                    leave-to-class="opacity-0 max-h-0"
                                >
                                    <div v-if="openFaq === index" class="overflow-hidden">
                                        <p class="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ faq.a }}</p>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Right: Contact form -->
                <div class="py-12 lg:py-16 lg:pl-12">
                    <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-6">// KIRIM PESAN</p>

                    <!-- Success state -->
                    <Transition
                        enter-active-class="transition-all duration-300 ease-out"
                        enter-from-class="opacity-0 -translate-y-2"
                        enter-to-class="opacity-100 translate-y-0"
                    >
                        <div v-if="submitSuccess" class="mb-6 p-4 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 flex items-start gap-3">
                            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-emerald-700 dark:text-emerald-400 text-sm font-bold tracking-wider uppercase">
                                Pesan terkirim! Kami akan merespon dalam 24 jam.
                            </p>
                        </div>
                    </Transition>

                    <!-- Error state -->
                    <div v-if="submitError" class="mb-6 p-4 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-red-700 dark:text-red-400 text-sm font-bold tracking-wider uppercase">
                            Gagal mengirim pesan. Coba lagi atau hubungi kami langsung melalui email.
                        </p>
                    </div>

                    <form @submit.prevent="handleSubmit" class="space-y-4">

                        <!-- Type selector -->
                        <div>
                            <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-2">Tipe Pesan</label>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-for="ct in contactTypes"
                                    :key="ct.id"
                                    type="button"
                                    @click="formData.type = ct.id"
                                    class="px-4 py-2 text-xs font-bold tracking-widest border transition-colors"
                                    :class="formData.type === ct.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-500 hover:border-gray-400 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'"
                                >
                                    {{ ct.label }}
                                </button>
                            </div>
                        </div>

                        <!-- Name & Email row -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">Nama</label>
                                <input
                                    v-model="formData.name"
                                    type="text"
                                    required
                                    placeholder="Nama lengkap"
                                    class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                                />
                            </div>
                            <div>
                                <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">Email</label>
                                <input
                                    v-model="formData.email"
                                    type="email"
                                    required
                                    placeholder="email@kamu.com"
                                    class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                                />
                            </div>
                        </div>

                        <!-- Subject -->
                        <div>
                            <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">Subjek</label>
                            <input
                                v-model="formData.subject"
                                type="text"
                                required
                                placeholder="Topik pesan Anda"
                                class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                            />
                        </div>

                        <!-- Message -->
                        <div>
                            <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">Pesan</label>
                            <textarea
                                v-model="formData.message"
                                rows="5"
                                required
                                placeholder="Ceritakan lebih detail..."
                                class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors resize-none"
                            ></textarea>
                        </div>

                        <!-- Submit -->
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="group w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <template v-if="!isSubmitting">
                                KIRIM PESAN
                                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </template>
                            <template v-else>
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                MENGIRIM...
                            </template>
                        </button>

                        <p class="text-xs text-gray-400 text-center">
                            Dengan mengirim pesan, Anda menyetujui
                            <NuxtLink to="/privacy" class="text-indigo-600 dark:text-indigo-400 hover:underline">Kebijakan Privasi</NuxtLink>
                            kami.
                        </p>
                    </form>
                </div>
            </div>
        </div>

        <!-- Bottom strip -->
        <div class="container mx-auto px-6 lg:px-10 py-8">
            <p class="font-mono text-xs text-gray-300 dark:text-white/10 uppercase tracking-[0.15em]">
                &copy; {{ new Date().getFullYear() }} LOGIC SEKAI — SELALU SIAP MEMBANTU
            </p>
        </div>

    </div>
</template>
