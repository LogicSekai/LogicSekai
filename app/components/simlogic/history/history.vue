<script setup lang="ts">
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { Sandwich } from 'lucide-vue-next';

type Substat = {
    name: string;
    type: string;
    description: string;
}

const subStats: Substat[] = [
    {
        "name": "HP",
        "type": "numeric",
        "description": "Meningkatkan HP karakter."
    },
    {
        "name": "ATK",
        "type": "numeric",
        "description": "Meningkatkan ATK karakter."
    },
    {
        "name": "DEF",
        "type": "numeric",
        "description": "Meningkatkan DEF karakter."
    },
    {
        "name": "HP%",
        "type": "percentage",
        "description": "Meningkatkan HP karakter berdasarkan persentase."
    },
    {
        "name": "ATK%",
        "type": "percentage",
        "description": "Meningkatkan ATK karakter berdasarkan persentase."
    },
    {
        "name": "DEF%",
        "type": "percentage",
        "description": "Meningkatkan DEF karakter berdasarkan persentase."
    },
    {
        "name": "Elemental Mastery",
        "type": "numeric",
        "description": "Meningkatkan kekuatan reaksi elemen."
    },
    {
        "name": "Energy Recharge",
        "type": "percentage",
        "description": "Meningkatkan kecepatan pengisian Energy Burst."
    },
    {
        "name": "CRIT Rate",
        "type": "percentage",
        "description": "Meningkatkan peluang serangan kritis."
    },
    {
        "name": "CRIT DMG",
        "type": "percentage",
        "description": "Meningkatkan damage serangan kritis."
    }
]

const databaseArtifact = ref(JSON.parse(localStorage.getItem('database') || '[]'));
const filterSubstat = ref('');
const listArtifact = computed(() => {
    return databaseArtifact.value
        .filter((artifact: any) => !filterSubstat.value || artifact.upgradedSubStat === filterSubstat.value)
        .reverse()
        .slice(0, 50)
});
</script>

<template>
    <!-- Header bar -->
    <div class="border-b border-gray-100 dark:border-white/6 px-6 py-4 flex items-center justify-between gap-4">
        <div>
            <p class="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-0.5">// HISTORY</p>
            <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-sm">Riwayat Artifak</h2>
        </div>
        <!-- Filter -->
        <Select v-model="filterSubstat">
            <SelectTrigger class="w-44 rounded-none border-gray-200 dark:border-white/10 font-mono text-xs">
                <SelectValue placeholder="Semua substat" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel class="font-mono text-[0.6rem] uppercase tracking-widest">Substat</SelectLabel>
                    <SelectItem v-for="substat in subStats" :key="substat.name" :value="substat.name">
                        {{ substat.name }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/6">
        <!-- Empty state -->
        <div v-if="!listArtifact.length" class="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Sandwich class="h-8 w-8 text-gray-200 dark:text-white/10" />
            <p class="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-600">Belum ada data</p>
        </div>

        <div v-for="(artifact, i) in listArtifact" :key="i" class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
            <div class="grid grid-cols-[1fr_auto] gap-4 items-start">
                <!-- Sample & Fodder -->
                <div class="space-y-2 min-w-0">
                    <!-- Sample -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="shrink-0 font-mono text-[0.55rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 w-12">Sample</span>
                        <span class="font-mono text-[0.6rem] tracking-widest px-1.5 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 uppercase">{{ artifact.upgradedArtifact.mainStat }}</span>
                        <div class="flex flex-wrap gap-1">
                            <span
                                v-for="stat in artifact.upgradedArtifact.subStats"
                                :key="stat"
                                class="font-mono text-[0.55rem] tracking-[0.08em] px-1.5 py-0.5 border uppercase transition-colors"
                                :class="artifact.fodderArtifact.subStats.includes(stat)
                                    ? 'border-indigo-300 dark:border-indigo-500/60 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40'
                                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'"
                            >{{ stat }}</span>
                        </div>
                    </div>
                    <!-- Fodder -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="shrink-0 font-mono text-[0.55rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 w-12">Fodder</span>
                        <span class="font-mono text-[0.6rem] tracking-widest px-1.5 py-0.5 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 uppercase">{{ artifact.fodderArtifact.mainStat }}</span>
                        <div class="flex flex-wrap gap-1">
                            <span
                                v-for="stat in artifact.fodderArtifact.subStats"
                                :key="stat"
                                class="font-mono text-[0.55rem] tracking-[0.08em] px-1.5 py-0.5 border uppercase transition-colors"
                                :class="artifact.upgradedArtifact.subStats.includes(stat)
                                    ? 'border-indigo-300 dark:border-indigo-500/60 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40'
                                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'"
                            >{{ stat }}</span>
                        </div>
                    </div>
                </div>
                <!-- Upgraded substat -->
                <div class="shrink-0 flex flex-col items-end gap-1">
                    <span class="font-mono text-[0.5rem] tracking-[0.14em] uppercase text-gray-400 dark:text-gray-600">Naik</span>
                    <span class="font-mono text-[0.6rem] tracking-widest px-2 py-1 bg-indigo-600 dark:bg-indigo-500 text-white uppercase">{{ artifact.upgradedSubStat }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-100 dark:border-white/6 px-6 py-3">
        <span class="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-gray-400 dark:text-gray-600">
            {{ listArtifact.length }} entri
            <template v-if="filterSubstat"> — difilter: {{ filterSubstat }}</template>
        </span>
    </div>
</template>