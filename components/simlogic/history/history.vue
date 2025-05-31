<script setup lang="ts">
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { Badge } from '@/components/ui/badge';
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
    <h2 class="text-lg font-semibold">History</h2>
    <div class="mt-10 space-y-8">
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Latest List</h3>
            <div class="flex items-center">
                <div class="space-x-2">
                    <Badge>Sample</Badge>
                    <Badge variant="destructive">Fodder</Badge>
                </div>
                <div class="ml-auto">
                    <Select v-model="filterSubstat">
                        <SelectTrigger class="w-[180px]">
                            <SelectValue placeholder="Filter substat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Substat</SelectLabel>
                                <SelectItem v-for="substat in subStats" :key="substat.name" :value="substat.name">
                                    {{ substat.name }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div class="bg-gray-300 h-[600px] rounded-xl p-4 space-y-4 overflow-y-scroll">
                <div v-for="artifact in listArtifact" :key="artifact" class="bg-white p-2 rounded-lg space-y-2">
                    <div class="flex">
                        <div class="w-1/4">
                            <Badge>{{ artifact.upgradedArtifact.mainStat }}</Badge>
                        </div>
                        <div class="space-x-2">
                            <template v-for="sample in artifact.upgradedArtifact.subStats" :key="sample">
                                <Badge :variant="artifact.fodderArtifact.subStats.includes(sample) ? 'link' : 'outline'">{{ sample }}</Badge>
                            </template>
                        </div>
                    </div>
                    <div class="flex">
                        <div class="w-1/4">
                            <Badge variant="destructive">{{ artifact.fodderArtifact.mainStat }}</Badge>
                        </div>
                        <div class="space-x-2">
                            <template v-for="fodder in artifact.fodderArtifact.subStats" :key="fodder">
                                <Badge :variant="artifact.upgradedArtifact.subStats.includes(fodder) ? 'link' : 'outline'">{{ fodder }}</Badge>
                            </template>
                        </div>
                    </div>
                    <div class="flex">
                        <Badge variant="secondary"><Sandwich class="mr-2" /> {{ artifact.upgradedSubStat }}</Badge>
                    </div>
                </div>
            </div>
            <div class="text-sm">{{ listArtifact.length }} items result.</div>
            <!-- <Table>
                <TableCaption>A list of your recent artifact.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-fit">
                            Upgrated
                        </TableHead>
                        <TableHead>Sample</TableHead>
                        <TableHead>Fodder</TableHead>
                        <TableHead class="text-right">
                            Tracked
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="artifact in listArtifact" :key="artifact">
                        <TableCell class="font-medium">
                            {{ artifact.upgradedSubStat }}
                        </TableCell>
                        <TableCell>
                            <div class="space-x-2 space-y-2">
                                <Badge>{{ artifact.upgradedArtifact.mainStat }}</Badge>
                                <template v-for="sample in artifact.upgradedArtifact.subStats" :key="sample">
                                    <Badge variant="secondary">{{ sample }}</Badge>
                                </template>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div class="space-x-2 space-y-2">
                                <Badge variant="destructive">{{ artifact.fodderArtifact.mainStat }}</Badge>
                                <template v-for="fodder in artifact.fodderArtifact.subStats" :key="fodder">
                                    <Badge variant="secondary">{{ fodder }}</Badge>
                                </template>
                            </div>
                        </TableCell>
                        <TableCell class="text-right">
                            <template v-for="tracked in artifact.upgradedArtifact.subStats" :key="tracked">
                                <Badge v-if="artifact.fodderArtifact.subStats.includes(tracked)" variant="secondary">{{ tracked }}</Badge>
                            </template>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table> -->
        </div>
    </div>
</template>