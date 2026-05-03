<script setup lang="ts">
import { Dices, SquareStack, FolderSync, AlignStartVertical } from 'lucide-vue-next'

import SimlogicSimulate from '~/components/simlogic/simulate/simulate.vue'
import SimlogicHistory from '~/components/simlogic/history/history.vue'
import SimlogicBackupRestore from '~/components/simlogic/backup-restore/backup-restore.vue'

definePageMeta({
    layout: 'default'
})

useHead({
    title: 'SimLogic — Simulate Artifact Upgrade | Logic Sekai',
    meta: [
        {
            name: 'description',
            content: 'SimLogic adalah alat untuk melakukan analisa peningkatan substat pada artifak Genshin Impact. Prediksi, simulasikan, dan optimalkan upgrade artifak kamu.'
        }
    ]
})

const contentActive = ref<'simulate' | 'history' | 'backup-restore'>('simulate')

const navItems = [
    { key: 'simulate', label: 'Simulate Enhance', icon: Dices },
    { key: 'history', label: 'History', icon: SquareStack },
    { key: 'backup-restore', label: 'Backup & Restore', icon: FolderSync },
] as const
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- PAGE HEADER -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // TOOLS
                </span>
                <div class="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <div>
                        <h1 class="font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white"
                            style="font-size: clamp(2rem, 6vw, 3.5rem)">
                            SIMLOGIC
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Alat analisa peningkatan substat artifak Genshin Impact. Simulasikan, prediksi, dan optimalkan setiap upgrade artifakmu.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <AlignStartVertical class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">
                            Artifact Upgrade Simulator
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">

                <!-- SIDEBAR NAV -->
                <aside class="lg:col-span-1">
                    <!-- Mobile: horizontal tab strip -->
                    <div class="flex lg:hidden gap-0 border border-gray-200 dark:border-white/10 mb-8 overflow-x-auto">
                        <button
                            v-for="item in navItems"
                            :key="item.key"
                            @click="contentActive = item.key"
                            class="flex-1 min-w-28 flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0 whitespace-nowrap"
                            :class="contentActive === item.key
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                        >
                            <component :is="item.icon" class="h-3 w-3 shrink-0" />
                            {{ item.label }}
                        </button>
                    </div>

                    <!-- Desktop: vertical nav -->
                    <nav class="hidden lg:flex flex-col gap-px border border-gray-100 dark:border-white/6">
                        <button
                            v-for="item in navItems"
                            :key="item.key"
                            @click="contentActive = item.key"
                            class="flex items-center gap-3 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors text-left border-b border-gray-100 dark:border-white/6 last:border-b-0"
                            :class="contentActive === item.key
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4'"
                        >
                            <component :is="item.icon" class="h-4 w-4 shrink-0" />
                            {{ item.label }}
                        </button>
                    </nav>

                    <!-- Info card (desktop only) -->
                    <div class="hidden lg:block mt-6 border border-gray-100 dark:border-white/6 p-5">
                        <p class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-indigo-600 dark:text-indigo-400 mb-2">
                            // TENTANG
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            SimLogic membantu kamu menganalisa dan memprediksi peningkatan substat artifak, sehingga kamu bisa mengoptimalkan setiap proses upgrade.
                        </p>
                    </div>
                </aside>

                <!-- MAIN CONTENT -->
                <main class="lg:col-span-3">
                    <div class="border border-gray-100 dark:border-white/6 min-h-[500px]">
                        <SimlogicSimulate v-if="contentActive === 'simulate'" />
                        <SimlogicHistory v-else-if="contentActive === 'history'" />
                        <SimlogicBackupRestore v-else-if="contentActive === 'backup-restore'" />
                    </div>
                </main>

            </div>
        </div>

    </div>
</template>
