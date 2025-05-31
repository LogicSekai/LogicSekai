<script setup lang="ts">
const historicalData = ref<any[]>([]);

function saveData(event: { preventDefault: () => void; }) {
    event.preventDefault();

    const upgradedArtifact = {
        mainStat: (document.getElementById('upgradedMainStat') as HTMLInputElement).value,
        subStats: (document.getElementById('upgradedSubStats') as HTMLInputElement).value.split(',').map(s => s.trim())
    };

    const fodderArtifact = {
        mainStat: (document.getElementById('fodderMainStat') as HTMLInputElement).value,
        subStats: (document.getElementById('fodderSubStats') as HTMLInputElement).value.split(',').map(s => s.trim())
    };

    const upgradedSubStat = (document.getElementById('upgradedSubStat') as HTMLInputElement).value;

    historicalData.value.push({
        upgradedArtifact,
        fodderArtifact,
        upgradedSubStat
    });

    console.log('Data Tersimpan:', historicalData.value);
    alert('Data berhasil disimpan!');
}

function predictUpgrade(event: { preventDefault: () => void; }) {
    event.preventDefault();

    const upgradedArtifact = {
        mainStat: (document.getElementById('predictUpgradedMainStat') as HTMLInputElement).value,
        subStats: (document.getElementById('predictUpgradedSubStats') as HTMLInputElement).value.split(',').map(s => s.trim())
    };

    const fodderArtifact = {
        mainStat: (document.getElementById('predictFodderMainStat') as HTMLInputElement).value,
        subStats: (document.getElementById('predictFodderSubStats') as HTMLInputElement).value.split(',').map(s => s.trim())
    };

    const substatProbabilities = calculateSubstatProbabilities(historicalData.value);

    const predictions = predictSubstat(upgradedArtifact, substatProbabilities);

    const predictionResult = document.getElementById('predictionResult');
    if (predictionResult) {
        predictionResult.innerHTML = '<h3>Prediksi Substat yang Naik:</h3>' +
            Object.entries(predictions).map(([subStat, prob]) => 
                `<p>${subStat}: ${prob.toFixed(2)}%</p>`
            ).join('');
    }
}

function calculateSubstatProbabilities(historicalData: any[]) {
    const substatFrequency: Record<string, number> = {};

    historicalData.forEach(data => {
        if (!substatFrequency[data.upgradedSubStat]) {
            substatFrequency[data.upgradedSubStat] = 0;
        }
        substatFrequency[data.upgradedSubStat]++;
    });

    const total = Object.values(substatFrequency).reduce((sum, freq) => sum + freq, 0);

    const substatProbabilities: Record<string, number> = {};
    for (const [subStat, freq] of Object.entries(substatFrequency)) {
        substatProbabilities[subStat] = (freq / total) * 100;
    }

    return substatProbabilities;
}

function predictSubstat(upgradedArtifact: { mainStat?: string; subStats: any; }, substatProbabilities: Record<string, number>) {
    const potentialSubstats = upgradedArtifact.subStats;
    const predictions: Record<string, number> = {};

    potentialSubstats.forEach((subStat: string | number) => {
        predictions[subStat] = substatProbabilities[subStat] || 0;
    });

    return predictions;
}

</script>

<template>
    <div class="h-20"></div>
    <h2 class="text-3xl font-bold mb-4">Form Pengumpulan Data</h2>
    <form id="dataCollectionForm" @submit.prevent="saveData" class="space-y-4">
        <div class="bg-white rounded-md shadow-md p-4">
            <h3 class="text-2xl font-semibold mb-2">Artifact yang Diupgrade</h3>
            <div class="space-y-2">
                <label for="upgradedMainStat" class="block text-sm font-medium text-gray-700">Main Stat:</label>
                <input type="text" id="upgradedMainStat" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <label for="upgradedSubStats" class="block text-sm font-medium text-gray-700">Substats (pisahkan dengan koma):</label>
                <input type="text" id="upgradedSubStats" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        </div>

        <div class="bg-white rounded-md shadow-md p-4 mt-4">
            <h3 class="text-2xl font-semibold mb-2">Artifact yang Ditumbalkan</h3>
            <div class="space-y-2">
                <label for="fodderMainStat" class="block text-sm font-medium text-gray-700">Main Stat:</label>
                <input type="text" id="fodderMainStat" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <label for="fodderSubStats" class="block text-sm font-medium text-gray-700">Substats (pisahkan dengan koma):</label>
                <input type="text" id="fodderSubStats" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        </div>

        <div class="bg-white rounded-md shadow-md p-4 mt-4">
            <h3 class="text-2xl font-semibold mb-2">Hasil Upgrade</h3>
            <div class="space-y-2">
                <label for="upgradedSubStat" class="block text-sm font-medium text-gray-700">Substat yang Naik:</label>
                <input type="text" id="upgradedSubStat" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        </div>

        <button type="submit" class="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Simpan Data</button>
    </form>
    <div class="h-20"></div>
    <h2 class="text-3xl font-bold mb-4">Form Prediksi Upgrade</h2>
    <form id="upgradePredictionForm" class="space-y-4" @submit.prevent="predictUpgrade">
        <div class="bg-white rounded-md shadow-md p-4">
            <h3 class="text-2xl font-semibold mb-2">Artifact yang Diupgrade</h3>
            <div class="space-y-2">
                <label for="predictUpgradedMainStat" class="block text-sm font-medium text-gray-700">Main Stat:</label>
                <input type="text" id="predictUpgradedMainStat" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <label for="predictUpgradedSubStats" class="block text-sm font-medium text-gray-700">Substats (pisahkan dengan koma):</label>
                <input type="text" id="predictUpgradedSubStats" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        </div>

        <div class="bg-white rounded-md shadow-md p-4 mt-4">
            <h3 class="text-2xl font-semibold mb-2">Artifact yang Ditumbalkan</h3>
            <div class="space-y-2">
                <label for="predictFodderMainStat" class="block text-sm font-medium text-gray-700">Main Stat:</label>
                <input type="text" id="predictFodderMainStat" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <label for="predictFodderSubStats" class="block text-sm font-medium text-gray-700">Substats (pisahkan dengan koma):</label>
                <input type="text" id="predictFodderSubStats" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        </div>

        <button type="submit" class="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Prediksi Substat</button>
    </form>

<div id="predictionResult" class="mt-4 p-4 bg-white rounded-md shadow-md"></div>
</template>