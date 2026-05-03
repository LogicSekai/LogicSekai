<script setup lang="ts">
import { Trash, SendToBack, TextCursor, Send } from 'lucide-vue-next'

const formActive = ref('sample&fodder')
const modelMainStat = ref<string>('')
const modelSubstat = ref<string[]>([])
const modelMainStatX = ref<string>('')
const modelSubstatX = ref<string[]>([])
const modelFeedback = ref<string>('')
const fodderArtifactExamples = ref<any[]>([])
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
    if (modelSubstat.value.includes(substat)) {
        modelSubstat.value = modelSubstat.value.filter((s: string) => s !== substat);
    } else if (modelSubstat.value.length < 4) {
        modelSubstat.value = [...modelSubstat.value, substat];
    }
}

function addSubStatX(substat: string) {
    if (modelSubstatX.value.includes(substat)) {
        modelSubstatX.value = modelSubstatX.value.filter((s: string) => s !== substat);
    } else if (modelSubstatX.value.length < 4) {
        modelSubstatX.value = [...modelSubstatX.value, substat];
    }
}


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
        if (relevantArtifacts.length > 0 && relevantArtifacts[0]) {
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
        useToaster('error', 'Tidak boleh ada input yang kosong!');
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

    useToaster('success', 'Terima kasih atas feedback Anda.');
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
    const dataStat = {
        upgradedArtifact: { mainStat: modelMainStat.value, subStats: modelSubstat.value },
        fodderArtifact: { mainStat: modelMainStatX.value, subStats: modelSubstatX.value }
    };
    localStorage.setItem('dataStat', JSON.stringify(dataStat));
}

onMounted(() => {
    const dataStat = localStorage.getItem('dataStat');
    if (dataStat) {
        const p = JSON.parse(dataStat);
        const toStr = (v: any) => typeof v === 'object' ? v?.name ?? '' : v ?? '';
        modelMainStat.value = toStr(p.upgradedArtifact?.mainStat);
        modelSubstat.value = p.upgradedArtifact?.subStats ?? [];
        modelMainStatX.value = toStr(p.fodderArtifact?.mainStat);
        modelSubstatX.value = p.fodderArtifact?.subStats ?? [];
    }
})

function actionForms() {
    if(formActive.value == 'sample&fodder') {
        startSimulate();
        formActive.value = 'results';
        modelFeedback.value = '';
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
    <!-- Header bar -->
    <div class="border-b border-gray-100 dark:border-white/6 px-6 py-4 flex items-center justify-between">
        <div>
            <p class="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-0.5">// SIMULATE</p>
            <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-sm">Enhance Artifact</h2>
        </div>
        <!-- Step tabs -->
        <div class="flex gap-0 border border-gray-200 dark:border-white/10">
            <button
                v-for="tab in [{ key: 'sample&fodder', label: 'Input' }, { key: 'results', label: 'Results' }, { key: 'feedback', label: 'Feedback' }]"
                :key="tab.key"
                @click="formActive = tab.key"
                class="px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0"
                :class="formActive === tab.key
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            >{{ tab.label }}</button>
        </div>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        <!-- Step: sample & fodder -->
        <template v-if="formActive == 'sample&fodder'">
            <!-- Sample card -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Sample Artifact</span>
                </div>
                <div class="p-4 space-y-5">
                    <div class="space-y-1.5">
                        <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Main Stat</label>
                        <Select v-model="modelMainStat">
                            <SelectTrigger class="w-full rounded-none border-gray-200 dark:border-white/10 dark:bg-transparent dark:text-gray-200">
                                <SelectValue placeholder="Pilih main stat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="stat in mainStats" :key="stat.name" :value="stat.name">{{ stat.name }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                Substats <span class="text-gray-400 dark:text-gray-600">({{ modelSubstat.length }}/4)</span>
                            </label>
                            <button v-if="modelSubstat.length > 0" @click="modelSubstat = []" class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1">
                                <Trash class="h-3 w-3" /> Reset
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <button
                                v-for="stat in subStats"
                                :key="stat.name"
                                @click="addSubStat(stat.name)"
                                :disabled="modelSubstat.length >= 4 && !modelSubstat.includes(stat.name)"
                                class="px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                :class="modelSubstat.includes(stat.name)
                                    ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white'"
                            >{{ stat.name }}</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fodder card -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Fodder Artifact</span>
                </div>
                <div class="p-4 space-y-5">
                    <div class="space-y-1.5">
                        <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Main Stat</label>
                        <Select v-model="modelMainStatX">
                            <SelectTrigger class="w-full rounded-none border-gray-200 dark:border-white/10 dark:bg-transparent dark:text-gray-200">
                                <SelectValue placeholder="Pilih main stat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="stat in mainStats" :key="stat.name" :value="stat.name">{{ stat.name }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                Substats <span class="text-gray-400 dark:text-gray-600">({{ modelSubstatX.length }}/4)</span>
                            </label>
                            <button v-if="modelSubstatX.length > 0" @click="modelSubstatX = []" class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1">
                                <Trash class="h-3 w-3" /> Reset
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <button
                                v-for="stat in subStats"
                                :key="stat.name"
                                @click="addSubStatX(stat.name)"
                                :disabled="modelSubstatX.length >= 4 && !modelSubstatX.includes(stat.name)"
                                class="px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                :class="modelSubstatX.includes(stat.name)
                                    ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white'"
                            >{{ stat.name }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Step: results -->
        <template v-if="formActive == 'results'">
            <!-- Chart card -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Prediksi Substat</span>
                    <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            <span class="w-2 h-2 bg-gray-900 dark:bg-white inline-block"></span> Main Prediction
                        </span>
                        <span class="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            <span class="w-2 h-2 bg-indigo-500 inline-block"></span> Secondary Prediction
                        </span>
                    </div>
                </div>
                <div class="p-5 space-y-4">
                    <!-- Empty state -->
                    <div v-if="!finalResult.length" class="py-8 text-center">
                        <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-400 dark:text-gray-600">Belum ada data prediksi</p>
                    </div>

                    <!-- Bar rows -->
                    <div v-for="row in finalResult" :key="row.name" class="space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-700 dark:text-gray-300">{{ row.name }}</span>
                            <div class="flex items-center gap-3">
                                <span class="font-mono text-[0.6rem] text-gray-500 dark:text-gray-400">{{ row.percent.toFixed(1) }}%</span>
                                <span class="font-mono text-[0.6rem] text-indigo-500">{{ row.alternative.toFixed(1) }}%</span>
                            </div>
                        </div>
                        <!-- Main stat bar -->
                        <div class="h-2 w-full bg-gray-100 dark:bg-white/6 overflow-hidden">
                            <div
                                class="h-full bg-gray-900 dark:bg-white transition-all duration-500 ease-out"
                                :style="{ width: `${Math.min(row.percent, 100)}%` }"
                            />
                        </div>
                        <!-- Substat-based bar -->
                        <div class="h-1.5 w-full bg-gray-100 dark:bg-white/6 overflow-hidden">
                            <div
                                class="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                :style="{ width: `${Math.min(row.alternative, 100)}%` }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ref count -->
            <div v-if="rawdataResult.length || rawalternativeDataResult.length" class="flex items-center gap-6 px-1">
                <span class="font-mono text-[0.6rem] tracking-widest uppercase text-gray-400 dark:text-gray-600">
                    Berdasarkan <span class="text-gray-700 dark:text-gray-300">{{ rawdataResult.length }}</span> referensi main stat &amp;
                    <span class="text-gray-700 dark:text-gray-300">{{ rawalternativeDataResult.length }}</span> referensi substat
                </span>
            </div>

            <div v-if="AIRecomendation" class="border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/30 p-4">
                <p class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-indigo-600 dark:text-indigo-400 mb-2">// AI RECOMMENDATION</p>
                <p class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{{ AIRecomendation }}</p>
            </div>
        </template>

        <!-- Step: feedback -->
        <template v-if="formActive == 'feedback'">
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Substat yang Naik</span>
                </div>
                <div class="p-4">
                    <div class="space-y-1.5">
                        <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Pilih substat yang benar-benar naik</label>
                        <Select v-model="modelFeedback">
                            <SelectTrigger class="w-full rounded-none border-gray-200 dark:border-white/10 dark:bg-transparent dark:text-gray-200">
                                <SelectValue placeholder="Pilih substat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem v-for="stat in subStats.filter(s => modelSubstat.includes(s.name))" :key="stat.name" :value="stat.name">
                                        {{ stat.name }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <!-- Footer action -->
    <div class="border-t border-gray-100 dark:border-white/6 px-6 py-4 flex items-center justify-between">
        <span class="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-gray-400 dark:text-gray-600">
            {{ formActive === 'sample&fodder' ? 'Isi data artifak' : formActive === 'results' ? 'Lihat prediksi' : 'Kirim hasil aktual' }}
        </span>
        <button
            @click="actionForms"
            :disabled="(formActive == 'sample&fodder' && (!modelMainStat || !modelMainStatX || modelSubstat.length == 0 || modelSubstatX.length == 0)) || (formActive == 'feedback' && !modelFeedback)"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-mono uppercase tracking-[0.12em] hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
            <template v-if="formActive == 'sample&fodder'">
                <SendToBack class="h-3.5 w-3.5" />
                <span>Mulai Simulasi</span>
            </template>
            <template v-if="formActive == 'results'">
                <TextCursor class="h-3.5 w-3.5" />
                <span>Beri Feedback</span>
            </template>
            <template v-if="formActive == 'feedback'">
                <Send class="h-3.5 w-3.5" />
                <span>Kirim</span>
            </template>
        </button>
    </div>
</template>