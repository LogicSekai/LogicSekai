<script setup lang="ts">
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { cn } from '@/lib/utils'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList } from '@/components/ui/combobox'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import { Progress } from '~/components/ui/progress';
import { BarChart } from '@/components/ui/chart-bar';

import { toast } from '@/components/ui/toast/use-toast'

import { Check, ChevronsUpDown, Search, Trash } from 'lucide-vue-next'

definePageMeta({
    layout: 'empty'
})

const loadingSimulate = ref<number>(0)
const modelMainStat = ref<string | undefined>('')
const modelSubstat = ref<any>([])
const modelMainStatX = ref<string | undefined>('')
const modelSubstatX = ref<any>([])
const modelFeedback = ref<string | undefined>('')
const modelFeedbackActive = ref<typeof subStats[0]>()
const fodderArtifactExamples = ref<any[]>([])

const mainStatsActive = ref<typeof mainStats[0]>()
const mainStatsActiveX = ref<typeof mainStats[0]>()
const mainStats = [
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
        "name": "Pyro DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Pyro."
    },
    {
        "name": "Hydro DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Hydro."
    },
    {
        "name": "Electro DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Electro."
    },
    {
        "name": "Cryo DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Cryo."
    },
    {
        "name": "Anemo DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Anemo."
    },
    {
        "name": "Geo DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Geo."
    },
    {
        "name": "Dendro DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage elemen Dendro."
    },
    {
        "name": "Physical DMG Bonus",
        "type": "percentage",
        "description": "Meningkatkan damage fisik."
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
    },
    {
        "name": "Healing Bonus",
        "type": "percentage",
        "description": "Meningkatkan efektivitas healing."
    }
]

const subStats = [
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

function addSubStat(substat: string) {
    if (modelSubstat.value.length <= 4) {
        if (substat && !modelSubstat.value.includes(substat)) {
            modelSubstat.value = [...modelSubstat.value, substat];
        }
    } else {
        toast({
            title: 'Oops! Terjadi kesalahan.',
            description: 'Substat sudah lebih dari 4.',
            variant: 'destructive',
            duration: 2000
        });
    }
}

function addSubStatX(substat: string) {
    if (modelSubstatX.value.length <= 4) {
        if (substat && !modelSubstatX.value.includes(substat)) {
            modelSubstatX.value = [...modelSubstatX.value, substat];
        }
    } else {
        toast({
            title: 'Oops! Terjadi kesalahan.',
            description: 'Substat sudah lebih dari 4.',
            variant: 'destructive',
            duration: 2000
        });
    }
}

watch(mainStatsActive, () => {
    modelMainStat.value = mainStatsActive.value?.name;
});

watch(mainStatsActiveX, () => {
    modelMainStatX.value = mainStatsActiveX.value?.name;
});

watch(modelFeedbackActive, () => {
    modelFeedback.value = modelFeedbackActive.value?.name;
});

const finalResult = ref<any[]>([])
const dataResult = ref<any[]>([])
const rawdataResult = ref<any[]>([])
const alternativeDataResult = ref<any[]>([])
const rawalternativeDataResult = ref<any[]>([])

type typeArtifactDataBase = Array<{
    upgradedArtifact: {
        mainStat: string;
        subStats: string[];
    };
    fodderArtifact: {
        mainStat: string;
        subStats: string[];
    };
    upgradedSubStat: string;
}>;

const databaseArtifact = ref<typeArtifactDataBase>(JSON.parse(localStorage.getItem('database') || '[]'));

function simulateEnchant() {
    const upgradedArtifact = {
        mainStat: modelMainStat.value,
        subStats: modelSubstat.value
    };

    const fodderArtifact = {
        mainStat: modelMainStatX.value,
        subStats: modelSubstatX.value
    };

    const predictions = predictUpgrade(upgradedArtifact, fodderArtifact, databaseArtifact.value);
    // dataResult.value = predictions
    dataResult.value = predictions.predictions
    rawdataResult.value = predictions.ref
}

function alternativeSimulateEnchant() {
    const upgradedArtifact = {
        mainStat: modelMainStat.value,
        subStats: modelSubstat.value
    };

    const fodderArtifact = {
        mainStat: modelMainStatX.value,
        subStats: modelSubstatX.value
    };

    const predictions = predictSubstatBasedOnSubstats(upgradedArtifact, fodderArtifact, databaseArtifact.value);
    // alternativeDataResult.value = predictions
    alternativeDataResult.value = predictions.predictions
    rawalternativeDataResult.value = predictions.ref
}

function predictUpgrade(upgradedArtifact: any, fodderArtifact: any, historicalData: any[]) {
    const substatFrequency = <any>{};
    const ref = <any>[];

    historicalData.forEach((data, index) => {
        if (
            data.upgradedArtifact.mainStat === upgradedArtifact.mainStat &&
            data.fodderArtifact.mainStat === fodderArtifact.mainStat
        ) {
        if (!substatFrequency[data.upgradedSubStat]) {
            substatFrequency[data.upgradedSubStat] = 0;
        }
            substatFrequency[data.upgradedSubStat]++;
            ref.push(data)
        }

        loadingSimulate.value = Math.round((index + 1) / historicalData.length * 100);
    });

    const total = <any>Object.values(substatFrequency).reduce((sum: any, freq) => sum + freq, 0);
    const substatProbabilities = <any>{};

    for (const [subStat, freq] of Object.entries(substatFrequency)) {
        substatProbabilities[subStat] = (<any>freq / total) * 100;
    }

    // const predictions = <any>{};
    // upgradedArtifact.subStats.forEach((subStat: any) => {
    //     predictions[subStat] = substatProbabilities[subStat] || 0;
    // });
    const predictions = upgradedArtifact.subStats.map((subStat: any) => ({
        name: subStat,
        percent: substatProbabilities[subStat] || 0
    }));

    // return predictions;
    return {predictions, ref};
}

function predictSubstatBasedOnSubstats(upgradedArtifact: any, fodderArtifact: any, historicalData: any) {
    const substatFrequency = <any>{};
    const ref = <any>[];

    // Hitung frekuensi substat yang naik berdasarkan data historis
    historicalData.forEach((data: any) => {
        // Cek apakah substat dari upgradedArtifact dan fodderArtifact mirip dengan data historis
        if (
            arraysOverlap(upgradedArtifact.subStats, data.upgradedArtifact.subStats) &&
            arraysOverlap(fodderArtifact.subStats, data.fodderArtifact.subStats)
        ) {
        if (!substatFrequency[data.upgradedSubStat]) {
            substatFrequency[data.upgradedSubStat] = 0;
        }
            substatFrequency[data.upgradedSubStat]++;
            ref.push(data)
        }
    });

    // Hitung total frekuensi
    const total = <any>Object.values(substatFrequency).reduce((sum: any, freq: any) => sum + freq, 0);

    // Hitung probabilitas rata-rata
    const substatProbabilities = <any>{};
    for (const [subStat, freq] of Object.entries(substatFrequency)) {
        substatProbabilities[subStat] = (<any>freq / total) * 100;
    }

    // Kembalikan hasil dalam bentuk array of objects
    const predictions = upgradedArtifact.subStats.map((subStat: any) => ({
        name: subStat,
        percent: substatProbabilities[subStat] || 0
    }));

    // return predictions;
    return {predictions, ref};
}

// Fungsi bantuan untuk mengecek apakah dua array memiliki elemen yang sama
function arraysOverlap(arr1: any, arr2: any) {
    return arr1.some((item: any) => arr2.includes(item));
}

function generateFodderExamples() {
    const fodderExamples = <any>[];

    const upgradedArtifact = {
        mainStat: modelMainStat.value,
        subStats: modelSubstat.value
    }

    // Loop melalui setiap substat pada upgradedArtifact
    upgradedArtifact.subStats.forEach((subStat: any) => {
        // Cari artifact dari historicalData yang memiliki substat yang sesuai
        const relevantArtifacts = databaseArtifact.value.filter((data: any) =>
            data.upgradedSubStat === subStat &&
            data.fodderArtifact.subStats.includes(subStat)
        );

        // Ambil contoh fodder artifact dari historicalData
        if (relevantArtifacts.length > 0) {
            const example = relevantArtifacts[0].fodderArtifact; // Ambil contoh pertama
            fodderExamples.push({
                targetSubStat: subStat, // Substat yang ingin ditingkatkan
                fodderArtifact: example // Contoh fodder artifact dari historicalData
            });
        } else {
        // Jika tidak ada data, berikan contoh default
            fodderExamples.push({
                targetSubStat: subStat,
                fodderArtifact: {
                    mainStat: "ATK%", // Main stat default
                    subStats: [subStat, "DEF%", "Elemental Mastery", "HP%"] // Substat default
                }
            });
        }
    });

    fodderArtifactExamples.value = fodderExamples;
}

function combinePredictions(upgradeResult: any, substatResult: any) {
    const combinedPredictions = <any>[];

    // Loop melalui setiap substat pada upgradeResult
    upgradeResult.forEach((upgradePrediction: any) => {
        // Cari prediksi yang sesuai dari substatResult
        const substatPrediction = substatResult.find(
            (pred: any) => pred.name === upgradePrediction.name
        );

        // Gabungkan hasil prediksi
        combinedPredictions.push({
            name: upgradePrediction.name,
            percent: upgradePrediction.percent, // Persentase dari predictUpgrade
            alternative: substatPrediction ? substatPrediction.percent : 0 // Persentase dari predictSubstatBasedOnSubstats
        });
    });

    console.log(combinedPredictions);
    return combinedPredictions;
}

function sendFeedback() {
    const dataLocalStorage = JSON.parse(localStorage.getItem('database') || '[]');
    const upgradedArtifact = {
        mainStat: modelMainStat.value,
        subStats: modelSubstat.value
    };

    const fodderArtifact = {
        mainStat: modelMainStatX.value,
        subStats: modelSubstatX.value
    };

    const upgradedSubStat = modelFeedback.value;

    if (upgradedArtifact.mainStat === '' || fodderArtifact.mainStat === '' || upgradedSubStat === '') {
        toast({
            title: 'Gagal!',
            description: 'Tidak boleh ada input yang kosong!',
            variant: 'destructive',
            duration: 2000
        });
        return;
    }

    // if (dataLocalStorage.some((data: any) =>
    //     upgradedArtifact.mainStat === data.upgradedArtifact.mainStat &&
    //     arraysOverlap(upgradedArtifact.subStats, data.upgradedArtifact.subStats) &&
    //     fodderArtifact.mainStat === data.fodderArtifact.mainStat &&
    //     arraysOverlap(fodderArtifact.subStats, data.fodderArtifact.subStats) &&
    //     upgradedSubStat === data.upgradedSubStat
    // )) {
    //     toast({
    //         title: 'Gagal!',
    //         description: 'Data yang Anda inputkan sudah ada di database!',
    //         variant: 'destructive',
    //         duration: 2000
    //     });
    //     return;
    // }

    dataLocalStorage.push({
        upgradedArtifact,
        fodderArtifact,
        upgradedSubStat
    });

    localStorage.setItem('database', JSON.stringify(dataLocalStorage));
    databaseArtifact.value = dataLocalStorage;

    startSimulate();

    toast({
        title: 'Berhasil!',
        description: 'Terima kasih atas feedback Anda.',
        variant: 'default',
        duration: 2000
    });
}

function startSimulate() {
    simulateEnchant();
    alternativeSimulateEnchant();
    finalResult.value = combinePredictions(dataResult.value, alternativeDataResult.value)
    generateFodderExamples();
    saveLastInputDataSimulate();
}

function saveLastInputDataSimulate() {
    const upgradedArtifact = {
        mainStat: mainStatsActive.value,
        subStats: modelSubstat.value
    };

    const fodderArtifact = {
        mainStat: mainStatsActiveX.value,
        subStats: modelSubstatX.value
    };

    const dataStat = { upgradedArtifact, fodderArtifact };
    localStorage.setItem('dataStat', JSON.stringify(dataStat));
}

onMounted(() => {
    const dataStat = localStorage.getItem('dataStat');
    if (dataStat) {
        const parsedDataStat = JSON.parse(dataStat);
        mainStatsActive.value = parsedDataStat.upgradedArtifact.mainStat;
        modelSubstat.value = parsedDataStat.upgradedArtifact.subStats;
        mainStatsActiveX.value = parsedDataStat.fodderArtifact.mainStat;
        modelSubstatX.value = parsedDataStat.fodderArtifact.subStats;
    }
})
</script>

<template>
    <div class="w-full flex justify-center min-h-screen bg-[url('https://upload-os-bbs.hoyolab.com/upload/2025/03/05/e63e03166861d48b604dfc4a4f561646_8631528651994824719.jpg?x-oss-process=image/auto-orient,0/interlace,1/format,webp/quality,q_70')] bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden">
        <div class="my-32 w-full px-6 space-y-4 relative">
            <div class="grid grid-cols-2 gap-2">
                <div class="grid grid-rows-2 gap-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enchan Artifact</CardTitle>
                            <CardDescription>Catatan hanya untuk artefak yang sudah memiliki 4 substat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="flex flex-col gap-2">
                                <Label>Artifak yang diupgrate</Label>
                                <div class="grid grid-cols-2 gap-2">
                                    <!-- Main stat -->
                                    <Combobox v-model="mainStatsActive" by="name">
                                        <ComboboxAnchor as-child>
                                            <ComboboxTrigger as-child>
                                                <Button variant="outline" class="justify-between w-full">
                                                {{ mainStatsActive?.name ?? 'Select main stat' }}
                
                                                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </ComboboxTrigger>
                                        </ComboboxAnchor>
                
                                        <ComboboxList class="w-full">
                                            <div class="relative w-full items-center">
                                                <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Select framework..." />
                                                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                                                    <Search class="size-4 text-muted-foreground" />
                                                </span>
                                            </div>
                
                                            <ComboboxEmpty>
                                                No stat found.
                                            </ComboboxEmpty>
                
                                            <ComboboxGroup>
                                                <ComboboxItem
                                                v-for="mainstat in mainStats"
                                                :key="mainstat.name"
                                                :value="mainstat"
                                                >
                                                {{ mainstat.name }}
                
                                                    <ComboboxItemIndicator>
                                                        <Check :class="cn('ml-auto h-4 w-4')" />
                                                    </ComboboxItemIndicator>
                                                </ComboboxItem>
                                            </ComboboxGroup>
                                        </ComboboxList>
                                    </Combobox>
            
                                    <!-- Substat -->
                                    <TagsInput v-model="modelSubstat">
                                        <TagsInputItem v-for="item in modelSubstat" :key="item" :value="item">
                                            <TagsInputItemText />
                                            <TagsInputItemDelete />
                                        </TagsInputItem>
            
                                        <Combobox by="name">
                                            <ComboboxAnchor as-child>
                                                <ComboboxTrigger as-child>
                                                    <Button variant="outline" class="justify-between w-full">
                                                        Add substat
                    
                                                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </ComboboxTrigger>
                                            </ComboboxAnchor>
                    
                                            <ComboboxList class="w-full">
                                                <div class="relative w-full items-center">
                                                    <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Select substat..." />
                                                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                                                        <Search class="size-4 text-muted-foreground" />
                                                    </span>
                                                </div>
                    
                                                <ComboboxEmpty>
                                                    No substat found.
                                                </ComboboxEmpty>
                    
                                                <ComboboxGroup>
                                                    <ComboboxItem
                                                    v-for="substat in subStats"
                                                    :key="substat.name"
                                                    :value="substat"
                                                    @click="addSubStat(substat.name)">
                                                        {{ substat.name }}
                                                        <span v-if="modelSubstat.includes(substat.name)">
                                                            <Check class="ml-auto h-4 w-4" />
                                                        </span>
                                                    </ComboboxItem>
                                                </ComboboxGroup>
                                            </ComboboxList>
                                        </Combobox>
                                        
                                        <Button v-if="modelSubstat.length > 0" size="icon" variant="ghost" type="button" @click="modelSubstat = []">
                                            <Trash class="h-4 w-4" />
                                        </Button>
                                    </TagsInput>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <Label>Artifak yang ditumbalkan</Label>
                                <div class="grid grid-cols-2 gap-2">
                                    <!-- Main stat -->
                                    <Combobox v-model="mainStatsActiveX" by="name">
                                        <ComboboxAnchor as-child>
                                            <ComboboxTrigger as-child>
                                                <Button variant="outline" class="justify-between w-full">
                                                {{ mainStatsActiveX?.name ?? 'Select main stat' }}
                
                                                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </ComboboxTrigger>
                                        </ComboboxAnchor>
                
                                        <ComboboxList class="w-full">
                                            <div class="relative w-full items-center">
                                                <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Select framework..." />
                                                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                                                    <Search class="size-4 text-muted-foreground" />
                                                </span>
                                            </div>
                
                                            <ComboboxEmpty>
                                                No stat found.
                                            </ComboboxEmpty>
                
                                            <ComboboxGroup>
                                                <ComboboxItem
                                                v-for="mainstat in mainStats"
                                                :key="mainstat.name"
                                                :value="mainstat"
                                                >
                                                {{ mainstat.name }}
                
                                                    <ComboboxItemIndicator>
                                                        <Check :class="cn('ml-auto h-4 w-4')" />
                                                    </ComboboxItemIndicator>
                                                </ComboboxItem>
                                            </ComboboxGroup>
                                        </ComboboxList>
                                    </Combobox>
            
                                    <!-- Substat -->
                                    <TagsInput v-model="modelSubstatX">
                                        <TagsInputItem v-for="item in modelSubstatX" :key="item" :value="item">
                                            <TagsInputItemText />
                                            <TagsInputItemDelete />
                                        </TagsInputItem>
            
                                        <Combobox by="name">
                                            <ComboboxAnchor as-child>
                                                <ComboboxTrigger as-child>
                                                    <Button variant="outline" class="justify-between w-full">
                                                        Add substat
                    
                                                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </ComboboxTrigger>
                                            </ComboboxAnchor>
                    
                                            <ComboboxList class="w-full">
                                                <div class="relative w-full items-center">
                                                    <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Select substat..." />
                                                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                                                        <Search class="size-4 text-muted-foreground" />
                                                    </span>
                                                </div>
                    
                                                <ComboboxEmpty>
                                                    No substat found.
                                                </ComboboxEmpty>
                    
                                                <ComboboxGroup>
                                                    <ComboboxItem
                                                    v-for="substat in subStats"
                                                    :key="substat.name"
                                                    :value="substat"
                                                    @click="addSubStatX(substat.name)">
                                                        {{ substat.name }}
                                                        <span v-if="modelSubstatX.includes(substat.name)">
                                                            <Check class="ml-auto h-4 w-4" />
                                                        </span>
                                                    </ComboboxItem>
                                                </ComboboxGroup>
                                            </ComboboxList>
                                        </Combobox>
        
                                        <Button v-if="modelSubstatX.length > 0" size="icon" variant="ghost" type="button" @click="modelSubstatX = []">
                                            <Trash class="h-4 w-4" />
                                        </Button>
                                    </TagsInput>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div class="w-full mr-6">
                                <Progress v-if="loadingSimulate > 0 && loadingSimulate < 100" :model-value="loadingSimulate" />
                            </div>
                            <Button class="ml-auto" type="submit" @click="startSimulate"
                            :disabled="!modelMainStat || !modelMainStatX || modelSubstat.length == 0 || modelSubstatX.length == 0"
                            >Simulate</Button>
                        </CardFooter>
                    </Card>

                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Feedback</CardTitle>
                            <CardDescription>Kirim hasil simulasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Combobox v-model="modelFeedbackActive" by="name">
                                <ComboboxAnchor as-child>
                                    <ComboboxTrigger as-child>
                                        <Button variant="outline" class="justify-between w-full">
                                        {{ modelFeedbackActive?.name ?? 'Select main stat' }}

                                            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </ComboboxTrigger>
                                </ComboboxAnchor>

                                <ComboboxList class="w-full">
                                    <div class="relative w-full items-center">
                                        <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Select framework..." />
                                        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                                            <Search class="size-4 text-muted-foreground" />
                                        </span>
                                    </div>

                                    <ComboboxEmpty>
                                        No stat found.
                                    </ComboboxEmpty>

                                    <ComboboxGroup>
                                        <ComboboxItem
                                        v-for="substat in subStats.filter(s => modelSubstat.includes(s.name))"
                                        :key="substat.name"
                                        :value="substat"
                                        >
                                        {{ substat.name }}

                                            <ComboboxItemIndicator>
                                                <Check :class="cn('ml-auto h-4 w-4')" />
                                            </ComboboxItemIndicator>
                                        </ComboboxItem>
                                    </ComboboxGroup>
                                </ComboboxList>
                            </Combobox>
                        </CardContent>
                        <CardFooter>
                            <Button class="ml-auto" type="submit" @click="sendFeedback">Send</Button>
                        </CardFooter>
                    </Card>
                </div>

                <div class="grid grid-rows-2 gap-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Result(Save) & Alternative(Risky)</CardTitle>
                            <CardDescription>Berikut hasil dari simulasi | RNG masih berlaku</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                index="name"
                                :data="finalResult"
                                :categories="['percent', 'alternative']"
                                :y-formatter="(tick, i) => {
                                return typeof tick === 'number'
                                    ? `${tick}%`
                                    : ''
                                }"
                                :rounded-corners="8"
                            />
                        </CardContent>
                    </Card>
                    
                    <!-- <Card>
                        <CardHeader>
                            <CardTitle>Hasil Simulasi</CardTitle>
                            <CardDescription>Berikut hasil dari simulasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                index="name"
                                :data="dataResult"
                                :categories="['percent']"
                                :y-formatter="(tick, i) => {
                                return typeof tick === 'number'
                                    ? `${tick}%`
                                    : ''
                                }"
                                :rounded-corners="4"
                            />
                        </CardContent>
                    </Card>
    
                    <Card>
                        <CardHeader>
                            <CardTitle>Alternative (Risky)</CardTitle>
                            <CardDescription>Berikut hasil dari simulasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                index="name"
                                :data="alternativeDataResult"
                                :categories="['percent']"
                                :y-formatter="(tick, i) => {
                                return typeof tick === 'number'
                                    ? `${tick}%`
                                    : ''
                                }"
                                :rounded-corners="4"
                            />
                        </CardContent>
                    </Card> -->

                    <Card>
                        <CardHeader>
                            <CardTitle>Contoh Fodder Artifact</CardTitle>
                            <CardDescription>Berikut contoh artifak yang cocok untuk ditumbalkan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul class="grid grid-cols-2 gap-4">
                                <template v-for="example in fodderArtifactExamples" :key="example.mainStat">
                                    <li>
                                        <div class="px-4 py-2">
                                            <h3 class="text-md font-medium">Target Up | {{ example.targetSubStat }}</h3>
                                            <p>Main Stat - {{ example.fodderArtifact.mainStat }}</p>
                                            <ul class="list-disc pl-4">
                                                <li v-for="subStat in example.fodderArtifact.subStats" :key="subStat">
                                                    {{ subStat }}
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                </template>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>