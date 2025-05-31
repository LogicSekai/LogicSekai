<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Search, Trash, SendToBack, TextCursor, Send } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast/use-toast'

const formActive = ref('sample&fodder')
const modelMainStat = ref<string | undefined>('')
const modelSubstat = ref<any>([])
const modelMainStatX = ref<string | undefined>('')
const modelSubstatX = ref<any>([])
const modelFeedback = ref<string | undefined>('')
const modelFeedbackActive = ref<typeof subStats[0]>()
const fodderArtifactExamples = ref<any[]>([])
const mainStatsActive = ref<typeof mainStats[0]>()
const mainStatsActiveX = ref<typeof mainStats[0]>()
const AIRecomendation = ref<string>('')

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
        // toast({
        //     title: 'Oops! Terjadi kesalahan.',
        //     description: 'Substat sudah lebih dari 4.',
        //     variant: 'destructive',
        //     duration: 2000
        // });
    }
}

function addSubStatX(substat: string) {
    if (modelSubstatX.value.length <= 4) {
        if (substat && !modelSubstatX.value.includes(substat)) {
            modelSubstatX.value = [...modelSubstatX.value, substat];
        }
    } else {
        // toast({
        //     title: 'Oops! Terjadi kesalahan.',
        //     description: 'Substat sudah lebih dari 4.',
        //     variant: 'destructive',
        //     duration: 2000
        // });
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

        // loadingSimulate.value = Math.round((index + 1) / historicalData.length * 100);
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


    // AI Upgrade Recommendation:
    const recommendation = generateSmartRecommendation(
        {
            mainStat: modelMainStat.value,
            subStats: modelSubstat.value
        },
        {
            mainStat: modelMainStatX.value,
            subStats: modelSubstatX.value
        },
        databaseArtifact.value
    );
    AIRecomendation.value = recommendation.recommendation.explanation;


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

function actionForms() {
    if(formActive.value == 'sample&fodder') {
        startSimulate();
        formActive.value = 'results';
        modelFeedback.value = '';
        modelFeedbackActive.value = <typeof subStats[0]>{};
    } else if(formActive.value == 'results') {
        formActive.value = 'feedback';
    } else if (formActive.value == 'feedback') {
        sendFeedback();
        formActive.value = 'sample&fodder';
    }
}

function predictAndCombine(upgradedArtifact: any, fodderArtifact: any, historicalData: any) {
    // Dapatkan prediksi dari kedua metode
    const upgradeResult = predictUpgrade(upgradedArtifact, fodderArtifact, historicalData);
    const substatResult = predictSubstatBasedOnSubstats(upgradedArtifact, fodderArtifact, historicalData);

    // Gabungkan hasilnya
    const combinedPredictions = upgradeResult.predictions.map((upgradePred: any) => {
        const substatPred = substatResult.predictions.find(
            (pred: any) => pred.name === upgradePred.name
        );
        return {
        name: upgradePred.name,
        percent: upgradePred.percent,
        percentX: substatPred ? substatPred.percent : 0
        };
    });

    return {
        predictions: combinedPredictions,
        upgradeRef: upgradeResult.ref,
        substatRef: substatResult.ref
    };
}

function generateSmartRecommendation(upgradedArtifact: any, fodderArtifact: any, historicalData:any) {
  // 1. Dapatkan prediksi gabungan
    const { predictions, upgradeRef, substatRef } = predictAndCombine(upgradedArtifact, fodderArtifact, historicalData);
    
    // 2. Hitung statistik penting
    const totalRef = upgradeRef.length + substatRef.length;
    const successRates = predictions.map((p: any) => (p.percent + p.percentX) / 2);
    const maxSuccess = Math.max(...successRates);
    
    // 3. Tentukan rekomendasi utama
    const mainRecommendation = predictions.find((p: any) => 
        (p.percent + p.percentX) / 2 === maxSuccess
    );

    // 4. Bangun analisis detail
    const detailedAnalysis = predictions.map((p: any) => ({
        substat: p.name,
        upgradeChance: p.percent,
        substatBasedChance: p.percentX,
        averageChance: (p.percent + p.percentX) / 2,
        confidence: getConfidenceLevel(p.percent, p.percentX)
    }));

    // 5. Hasilkan penjelasan AI
    const explanation = generateAIExplanation(mainRecommendation, detailedAnalysis, totalRef);

    return {
        predictions: detailedAnalysis,
        recommendation: {
            targetSubstat: mainRecommendation.name,
            successProbability: maxSuccess,
            confidence: getConfidenceLevel(mainRecommendation.percent, mainRecommendation.percentX),
            explanation
        },
        referenceData: {
            totalCases: totalRef,
            upgradeRefCount: upgradeRef.length,
            substatRefCount: substatRef.length
        }
    };
}

// Helper functions
function getConfidenceLevel(percent1: any, percent2: any) {
    const diff = Math.abs(percent1 - percent2);
    if (diff < 15) return 'High';
    if (diff < 30) return 'Medium';
    return 'Low';
}

function generateAIExplanation(mainRec: any, analysis: any, totalCases: any) {
    const topSubstats = analysis.sort((a: any,b: any) => b.averageChance - a.averageChance).slice(0,2);
    
    let explanation = `Berdasarkan analisis ${totalCases} kasus historis:\n`;
    explanation += `• Substat terbaik untuk ditingkatkan: ${mainRec.name} (${Math.round(mainRec.percent)}% | ${Math.round(mainRec.percentX)}%)\n`;
    
    if (topSubstats[0].averageChance > 60) {
        explanation += `Kesempatan sukses sangat tinggi (${Math.round(topSubstats[0].averageChance)}%) `;
        explanation += `dengan konsistensi ${topSubstats[0].confidence}.\n`;
    } else {
        explanation += `Pertimbangkan juga ${topSubstats[1].substat} (${Math.round(topSubstats[1].averageChance)}%) `;
        explanation += `sebagai alternatif.\n`;
    }
    
    explanation += `\nDetail analisis:\n`;
    analysis.forEach((a: any) => {
        explanation += `- ${a.substat}: ${a.averageChance.toFixed(1)}% (${a.confidence} confidence)\n`;
    });
    
    return explanation;
}
</script>

<template>
    <h2 class="text-lg font-semibold">Enhance Artifact</h2>
    <div class="mt-10 space-y-8">
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Simulation</h3>
            <div class="grid grid-cols-3 gap-4 bg-gray-200 py-2 px-4 rounded-lg">
                <Button :class="formActive == 'sample&fodder' ? 'bg-white text-gray-600' : 'bg-gray-200 text-gray-400'" class="shadow-none hover:bg-gray-100 hover:text-gray-600"
                @click="formActive = 'sample&fodder'">Sample & Fodder</Button>
                <Button :class="formActive == 'results' ? 'bg-white text-gray-600' : 'bg-gray-200 text-gray-400'" class="shadow-none hover:bg-gray-100 hover:text-gray-600"
                @click="formActive = 'results'">Results</Button>
                <Button :class="formActive == 'feedback' ? 'bg-white text-gray-600' : 'bg-gray-200 text-gray-400'" class="shadow-none hover:bg-gray-100 hover:text-gray-600"
                @click="formActive = 'feedback'">Feedback</Button>
            </div>
        </div>

        <div v-if="formActive == 'sample&fodder'" class="space-y-4">
            <h3 class="text-lg font-semibold">Options sample</h3>
            <div class="bg-gray-200 rounded-lg p-4 space-y-6">
                <div>
                    <div class="font-medium text-gray-700">Main Stat</div>
                    <Combobox v-model="mainStatsActive" by="name">
                        <ComboboxAnchor as-child>
                            <ComboboxTrigger as-child>
                                <Button variant="outline" class="justify-between w-full py-6">
                                {{ mainStatsActive?.name ?? 'Select main stat' }}
        
                                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </ComboboxTrigger>
                        </ComboboxAnchor>
        
                        <ComboboxList class="w-full ml-[-115%]">
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
                </div>
    
                <div>
                    <div class="font-medium text-gray-700">Substats</div>
                    <TagsInput v-model="modelSubstat">
                        <TagsInputItem v-for="item in modelSubstat" :key="item" :value="item" class="py-4 px-2">
                            <TagsInputItemText />
                            <TagsInputItemDelete />
                        </TagsInputItem>
        
                        <Combobox by="name">
                            <ComboboxAnchor as-child>
                                <ComboboxTrigger as-child>
                                    <Button variant="outline" class="justify-between w-full" :class="modelSubstat.length < 4 ? '' : 'hidden'">
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

                <!-- <div class="flex">
                    <Button class="bg-gray-800 rounded-lg text-gray-50 hover:bg-gray-600 ml-auto" @click="formActive = 'fodder'">
                        <SendToBack />
                        <span>Set Sample</span>
                    </Button>
                </div> -->
            </div>

            <h3 class="text-lg font-semibold">Options fodder</h3>
            <div class="bg-gray-200 rounded-lg p-4 space-y-6">
                <div>
                    <div class="font-medium text-gray-700">Main Stat</div>
                    <Combobox v-model="mainStatsActiveX" by="name">
                        <ComboboxAnchor as-child>
                            <ComboboxTrigger as-child>
                                <Button variant="outline" class="justify-between w-full py-6">
                                {{ mainStatsActiveX?.name ?? 'Select main stat' }}

                                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </ComboboxTrigger>
                        </ComboboxAnchor>

                        <ComboboxList class="w-full ml-[-115%]">
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
                </div>
    
                <div>
                    <div class="font-medium text-gray-700">Substats</div>
                    <TagsInput v-model="modelSubstatX">
                        <TagsInputItem v-for="item in modelSubstatX" :key="item" :value="item" class="py-4 px-2">
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
            <!-- <div class="flex">
                <Button class="bg-gray-800 rounded-lg text-gray-50 hover:bg-gray-600 ml-auto" @click="() => {
                    startSimulate();
                    formActive = 'results';
                }"
                :disabled="!modelMainStat || !modelMainStatX || modelSubstat.length == 0 || modelSubstatX.length == 0">
                    <SendToBack />
                    <span>Start!</span>
                </Button>
            </div> -->
        </div>

        <div v-if="formActive == 'results'">
            <div>
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
            </div>
            <div class="mt-6 text-gray-700">{{ AIRecomendation }}</div>
        </div>

        <div v-if="formActive == 'feedback'">
            <h3 class="text-lg font-semibold">Options fodder</h3>
            <div class="bg-gray-200 rounded-lg p-4 space-y-6">
                <div>
                    <div class="font-medium text-gray-700">Select substat</div>
                    <Combobox v-model="modelFeedbackActive" by="name">
                        <ComboboxAnchor as-child>
                            <ComboboxTrigger as-child>
                                <Button variant="outline" class="justify-between w-full py-6">
                                {{ modelFeedbackActive?.name ?? 'Select main stat' }}
        
                                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </ComboboxTrigger>
                        </ComboboxAnchor>
        
                        <ComboboxList class="w-full ml-[-115%]">
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
                </div>
            </div>
        </div>
    </div>

    <div class="flex mt-auto">
        <Button class="ml-auto bg-gray-800 rounded-lg text-gray-50 hover:bg-gray-600 ml-auto" @click="actionForms"
        :disabled="formActive == 'sample&fodder' && (!modelMainStat || !modelMainStatX || modelSubstat.length == 0 || modelSubstatX.length == 0) || formActive == 'feedback' && !modelFeedback">
            <template v-if="formActive == 'sample&fodder'">
                <SendToBack />
                <span>Start~!</span>
            </template>
            <template v-if="formActive == 'results'">
                <TextCursor />
                <span>Send Feedback!</span>
            </template>
            <template v-if="formActive == 'feedback'">
                <Send />
                <span>Send</span>
            </template>
        </Button>
    </div>
</template>