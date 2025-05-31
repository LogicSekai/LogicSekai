<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Search, Trash, SendToBack, TextCursor, Send } from 'lucide-vue-next'

// ==================== TYPES ====================
interface Stat {
    name: string
    type: string
    description: string
}

interface Artifact {
    mainStat: string
    subStats: string[]
}

interface HistoricalData {
    upgradedArtifact: Artifact
    fodderArtifact: Artifact
    upgradedSubStat: string
}

interface Prediction {
    name: string
    percent: number
    percentX?: number
    confidence?: string
    smartScore?: number
}

// ==================== REACTIVE STATE ====================
const formActive = ref<'sample&fodder' | 'results' | 'feedback'>('sample&fodder')
const modelMainStat = ref<string>('')
const modelSubstat = ref<string[]>([])
const modelMainStatX = ref<string>('')
const modelSubstatX = ref<string[]>([])
const modelFeedback = ref<string>('')
const mainStatsActive = ref<Stat>()
const mainStatsActiveX = ref<Stat>()
const AIRecomendation = ref<string>('')
const finalResult = ref<Prediction[]>([])
const databaseArtifact = ref<HistoricalData[]>(JSON.parse(localStorage.getItem('database') || '[]'))

// ==================== CONSTANTS ====================
const mainStats: Stat[] = [
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
const subStats: Stat[] = [
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

// ==================== CORE AI FUNCTIONS ====================
function predictUpgrade(
  upgradedArtifact: Artifact,
  fodderArtifact: Artifact,
  historicalData: HistoricalData[]
): { predictions: Prediction[]; ref: HistoricalData[] } {
  // 1. Inisialisasi variabel tracking
  const substatFrequency: Record<string, number> = {};
  const matchingCases: HistoricalData[] = [];
  let totalCases = 0;

  // 2. Analisis pola historis
  historicalData.forEach((data) => {
    // 2a. Cek kecocokan main stat dan substat
    const isMainStatMatch = 
      data.upgradedArtifact.mainStat === upgradedArtifact.mainStat &&
      data.fodderArtifact.mainStat === fodderArtifact.mainStat;

    // 2b. Hitung similarity score
    const similarityScore = calculateArtifactSimilarity(
      upgradedArtifact,
      fodderArtifact,
      data.upgradedArtifact,
      data.fodderArtifact
    );

    // 2c. Jika memenuhi kriteria minimum
    if (isMainStatMatch && similarityScore >= 0.6) {
      const substat = data.upgradedSubStat;
      const weight = similarityScore * 1.5; // Beri bobot lebih untuk kasus yang lebih mirip

      substatFrequency[substat] = (substatFrequency[substat] || 0) + weight;
      totalCases += weight;
      matchingCases.push(data);
    }
  });

  // 3. Fallback mechanism jika data kurang
  if (totalCases < 3) {
    return handleLowDataScenario(upgradedArtifact, historicalData);
  }

  // 4. Hitung probabilitas
  const predictions = upgradedArtifact.subStats.map((subStat) => {
    const rawProbability = (substatFrequency[subStat] || 0) / totalCases * 100;
    
    // 4a. Apply smoothing untuk menghindari probabilitas 0%
    const smoothedProbability = rawProbability < 5 ? 
      Math.min(5, rawProbability + 3) : 
      rawProbability;

    return {
      name: subStat,
      percent: parseFloat(smoothedProbability.toFixed(2))
    };
  });

  // 5. Normalisasi agar total probabilitas ~100%
  const totalProbability = predictions.reduce((sum, p) => sum + p.percent, 0);
  const normalizedPredictions = predictions.map(p => ({
    ...p,
    percent: parseFloat((p.percent * 100 / totalProbability).toFixed(2))
  }));

  return {
    predictions: normalizedPredictions,
    ref: matchingCases
  };
}

// Helper function 1: Menghitung similarity artifact
function calculateArtifactSimilarity(
  currentUpgraded: Artifact,
  currentFodder: Artifact,
  historicalUpgraded: Artifact,
  historicalFodder: Artifact
): number {
  let score = 0;

  // 1. Main stat match (bobot 40%)
  if (currentUpgraded.mainStat === historicalUpgraded.mainStat) score += 0.2;
  if (currentFodder.mainStat === historicalFodder.mainStat) score += 0.2;

  // 2. Substat match (bobot 60%)
  const upgradedOverlap = currentUpgraded.subStats
    .filter(s => historicalUpgraded.subStats.includes(s)).length;
  const fodderOverlap = currentFodder.subStats
    .filter(s => historicalFodder.subStats.includes(s)).length;

  score += 0.3 * (upgradedOverlap / currentUpgraded.subStats.length);
  score += 0.3 * (fodderOverlap / currentFodder.subStats.length);

  return Math.min(1, score * 1.2); // Beri bonus 20% untuk toleransi
}

// Helper function 2: Handle ketika data historis sedikit
function handleLowDataScenario(
  upgradedArtifact: Artifact,
  historicalData: HistoricalData[]
): { predictions: Prediction[]; ref: HistoricalData[] } {
  // 1. Hitung frekuensi global tanpa mempertimbangkan fodder artifact
  const globalFrequency: Record<string, number> = {};
  let globalTotal = 0;

  historicalData.forEach(data => {
    if (data.upgradedArtifact.mainStat === upgradedArtifact.mainStat) {
      globalFrequency[data.upgradedSubStat] = (globalFrequency[data.upgradedSubStat] || 0) + 1;
      globalTotal++;
    }
  });

  // 2. Jika masih tidak ada data, berikan probabilitas merata
  if (globalTotal === 0) {
    const equalProbability = 100 / upgradedArtifact.subStats.length;
    return {
      predictions: upgradedArtifact.subStats.map(subStat => ({
        name: subStat,
        percent: parseFloat(equalProbability.toFixed(2))
      })),
      ref: []
    };
  }

  // 3. Gunakan distribusi global
  return {
    predictions: upgradedArtifact.subStats.map(subStat => ({
      name: subStat,
      percent: parseFloat(((globalFrequency[subStat] || 0) / globalTotal * 100).toFixed(2))
    })),
    ref: historicalData.filter(data => 
      data.upgradedArtifact.mainStat === upgradedArtifact.mainStat
    )
  };
}

function predictSubstatBasedOnSubstats(
  upgradedArtifact: Artifact,
  fodderArtifact: Artifact,
  historicalData: HistoricalData[]
): { predictions: Prediction[]; ref: HistoricalData[] } {
  // 1. Inisialisasi variabel dengan Type Safety
  const substatScores: Record<string, { score: number; cases: HistoricalData[] }> = {};
  let totalScore = 0;

  // 2. Preprocessing: Filter data yang relevan
  const relevantData = historicalData.filter(data =>
    data.upgradedArtifact.subStats.some(s => upgradedArtifact.subStats.includes(s)) &&
    data.fodderArtifact.subStats.some(s => fodderArtifact.subStats.includes(s))
  );

  // 3. Hitung weighted score untuk setiap substat
  relevantData.forEach(data => {
    const similarity = calculateSubstatSimilarity(
      upgradedArtifact,
      fodderArtifact,
      data.upgradedArtifact,
      data.fodderArtifact
    );

    const weight = similarity * getTierMultiplier(data.upgradedSubStat);
    const substat = data.upgradedSubStat;

    if (!substatScores[substat]) {
      substatScores[substat] = { score: 0, cases: [] };
    }

    substatScores[substat].score += weight;
    substatScores[substat].cases.push(data);
    totalScore += weight;
  });

  // 4. Handle kasus data minimal (Smoothing Laplace)
  if (totalScore < 0.1) {
    return handleSparseDataCase(upgradedArtifact, relevantData);
  }

  // 5. Generate predictions dengan normalisasi
  const predictions = upgradedArtifact.subStats.map(subStat => {
    const baseProbability = (substatScores[subStat]?.score || 0) / totalScore * 100;
    const adjustedProbability = applyVarianceReduction(baseProbability, subStat);
    return {
      name: subStat,
      percent: parseFloat(adjustedProbability.toFixed(2))
    };
  });

  // 6. Normalisasi akhir
  return normalizePredictions(predictions, relevantData);
}

// Helper Functions:

/**
 * Menghitung similarity antara dua pasang artifact berdasarkan substat
 */
function calculateSubstatSimilarity(
  currentUpgraded: Artifact,
  currentFodder: Artifact,
  historicalUpgraded: Artifact,
  historicalFodder: Artifact
): number {
  // 1. Hitung overlap substat (Bobot 60%)
  const upgradedOverlap = currentUpgraded.subStats
    .filter(s => historicalUpgraded.subStats.includes(s)).length;
  const fodderOverlap = currentFodder.subStats
    .filter(s => historicalFodder.subStats.includes(s)).length;

  const substatSimilarity = (upgradedOverlap + fodderOverlap) / 
    (currentUpgraded.subStats.length + currentFodder.subStats.length);

  // 2. Hitung posisi substat matching (Bobot 40%)
  const positionBonus = calculatePositionBonus(
    currentUpgraded.subStats,
    historicalUpgraded.subStats
  );

  return (substatSimilarity * 0.6) + (positionBonus * 0.4);
}

/**
 * Memberikan bonus berdasarkan posisi substat yang match
 */
function calculatePositionBonus(
  currentSubstats: string[],
  historicalSubstats: string[]
): number {
  let bonus = 0;
  currentSubstats.forEach((substat, index) => {
    if (historicalSubstats[index] === substat) {
      bonus += 0.1 * (4 - index); // Lebih berat untuk substat awal
    }
  });
  return Math.min(1, bonus);
}

/**
 * Multiplier berdasarkan tier substat
 */
function getTierMultiplier(substat: string): number {
  const tierMap: Record<string, number> = {
    'CRIT Rate': 1.3,
    'CRIT DMG': 1.3,
    'ATK%': 1.2,
    'Elemental Mastery': 1.1,
    'Energy Recharge': 1.1,
  };
  return tierMap[substat] || 1.0;
}

/**
 * Handle ketika data sangat sedikit
 */
function handleSparseDataCase(
  upgradedArtifact: Artifact,
  relevantData: HistoricalData[]
): { predictions: Prediction[]; ref: HistoricalData[] } {
  // 1. Hitung distribusi global tanpa mempertimbangkan fodder
  const globalCounts: Record<string, number> = {};
  relevantData.forEach(data => {
    globalCounts[data.upgradedSubStat] = (globalCounts[data.upgradedSubStat] || 0) + 1;
  });

  const totalGlobal = Object.values(globalCounts).reduce((sum, count) => sum + count, 0);

  // 2. Jika ada data global
  if (totalGlobal > 0) {
    const predictions = upgradedArtifact.subStats.map(subStat => ({
      name: subStat,
      percent: parseFloat(((globalCounts[subStat] || 0.5) / (totalGlobal + 1) * 100).toFixed(2)) // Laplace smoothing
    }));
    return { predictions, ref: relevantData };
  }

  // 3. Fallback: Distribusi merata dengan probabilitas kecil
  const equalProb = 100 / upgradedArtifact.subStats.length;
  return {
    predictions: upgradedArtifact.subStats.map(subStat => ({
      name: subStat,
      percent: parseFloat((equalProb * 0.7).toFixed(2)) // Beri diskon 30% untuk data kurang
    })),
    ref: []
  };
}

/**
 * Reduksi varians untuk substat tertentu
 */
function applyVarianceReduction(baseProbability: number, substat: string): number {
  const varianceMap: Record<string, number> = {
    'CRIT Rate': 0.9,
    'CRIT DMG': 0.9,
    'ATK%': 0.95,
    'DEF%': 1.1,
    'HP%': 1.1
  };
  return baseProbability * (varianceMap[substat] || 1.0);
}

/**
 * Normalisasi prediksi ke total 100%
 */
function normalizePredictions(
  predictions: Prediction[],
  refData: HistoricalData[]
): { predictions: Prediction[]; ref: HistoricalData[] } {
  const total = predictions.reduce((sum, p) => sum + p.percent, 0);
  if (total <= 0) return { predictions, ref: refData };

  const normalized = predictions.map(p => ({
    ...p,
    percent: parseFloat((p.percent * 100 / total).toFixed(2))
  }));

  return {
    predictions: normalized,
    ref: refData
  };
}

function predictAndCombine(
  upgradedArtifact: Artifact,
  fodderArtifact: Artifact,
  historicalData: HistoricalData[]
): { predictions: CombinedPrediction[], upgradeRef: HistoricalData[], substatRef: HistoricalData[] } {
  // 1. Dapatkan prediksi dari kedua metode
  const upgradeResult = predictUpgrade(upgradedArtifact, fodderArtifact, historicalData);
  const substatResult = predictSubstatBasedOnSubstats(upgradedArtifact, fodderArtifact, historicalData);

  // 2. Hitung weights berdasarkan jumlah data referensi
  const upgradeWeight = calculateModelWeight(upgradeResult.ref.length);
  const substatWeight = calculateModelWeight(substatResult.ref.length);
  const totalWeight = upgradeWeight + substatWeight;

  // 3. Gabungkan prediksi dengan weighted average
  const combinedPredictions = upgradedArtifact.subStats.map(subStat => {
    const upgradePred = upgradeResult.predictions.find(p => p.name === subStat) || { percent: 0 };
    const substatPred = substatResult.predictions.find(p => p.name === subStat) || { percent: 0 };

    // Hitung weighted probability
    const combinedPercent = (upgradePred.percent * upgradeWeight + substatPred.percent * substatWeight) / totalWeight;

    // Hitung confidence score
    const confidence = calculateCombinedConfidence(
      upgradePred.percent,
      substatPred.percent,
      upgradeResult.ref.length,
      substatResult.ref.length
    );

    return {
      name: subStat,
      percent: parseFloat(combinedPercent.toFixed(2)),
      percentUpgrade: parseFloat(upgradePred.percent.toFixed(2)),
      percentSubstat: parseFloat(substatPred.percent.toFixed(2)),
      confidence,
      upgradeCases: upgradeResult.ref.filter(data => data.upgradedSubStat === subStat).length,
      substatCases: substatResult.ref.filter(data => data.upgradedSubStat === subStat).length
    };
  });

  // 4. Normalisasi probabilitas akhir
  normalizeProbabilities(combinedPredictions);

  return {
    predictions: combinedPredictions,
    upgradeRef: upgradeResult.ref,
    substatRef: substatResult.ref
  };
}

// Helper Functions

/**
 * Menghitung bobot model berdasarkan jumlah data referensi
 */
function calculateModelWeight(dataCount: number): number {
  // Sigmoid function untuk menentukan weight
  // https://en.wikipedia.org/wiki/Sigmoid_function
  return 1 / (1 + Math.exp(-0.1 * (dataCount - 10))); // Scaling factor 0.1, pivot pada 10 data
}

/**
 * Menghitung confidence score kombinasi
 */
function calculateCombinedConfidence(
  upgradePercent: number,
  substatPercent: number,
  upgradeCases: number,
  substatCases: number
): string {
  const percentDiff = Math.abs(upgradePercent - substatPercent);
  const totalCases = upgradeCases + substatCases;

  // Dynamic threshold berdasarkan jumlah data
  const highThreshold = Math.max(15, 25 - (totalCases / 5));
  const mediumThreshold = Math.max(30, 40 - (totalCases / 3));

  if (percentDiff < highThreshold && totalCases >= 8) return 'High';
  if (percentDiff < mediumThreshold && totalCases >= 5) return 'Medium';
  return 'Low';
}

/**
 * Normalisasi probabilitas ke total 100%
 */
function normalizeProbabilities(predictions: CombinedPrediction[]) {
  const total = predictions.reduce((sum, p) => sum + p.percent, 0);
  if (total <= 0) return;

  const scaleFactor = 100 / total;
  predictions.forEach(p => {
    p.percent = parseFloat((p.percent * scaleFactor).toFixed(2));
  });
}

// Type Definitions
interface CombinedPrediction extends Prediction {
  percentUpgrade: number;
  percentSubstat: number;
  confidence: string;
  upgradeCases: number;
  substatCases: number;
}

function generateAIRecommendation(
    combinedResult: {
        predictions: CombinedPrediction[];
        upgradeRef: HistoricalData[];
        substatRef: HistoricalData[];
    }
): {
    recommendation: AIRecommendation;
    analysis: SubstatAnalysis[];
    referenceStats: ReferenceStats;
} {
    // 1. Persiapan data awal
    const totalCases = combinedResult.upgradeRef.length + combinedResult.substatRef.length;
    const validPredictions = combinedResult.predictions.filter(p => p.percent > 0);

    // 2. Hitung skor prioritas untuk setiap substat
    const scoredPredictions = validPredictions.map(pred => {
        const priorityScore = calculatePriorityScore(pred, totalCases);
        return { ...pred, priorityScore };
    });

    // 3. Urutkan berdasarkan skor prioritas
    const sortedPredictions = [...scoredPredictions].sort((a, b) => b.priorityScore - a.priorityScore);
    const [bestChoice, secondChoice] = sortedPredictions;

    // 4. Generate rekomendasi AI
    const recommendation = generateRecommendationText(
        bestChoice,
        secondChoice,
        totalCases,
        combinedResult.upgradeRef.length,
        combinedResult.substatRef.length
    );

    // 5. Siapkan data analisis detail
    const analysis = scoredPredictions.map(pred => ({
        substat: pred.name,
        combinedProbability: pred.percent,
        upgradeProbability: pred.percentUpgrade,
        substatProbability: pred.percentSubstat,
        confidence: pred.confidence,
        priorityScore: pred.priorityScore,
        upgradeCases: pred.upgradeCases,
        substatCases: pred.substatCases
    }));

    // 6. Siapkan statistik referensi
    const referenceStats = {
        totalCases,
        upgradeCases: combinedResult.upgradeRef.length,
        substatCases: combinedResult.substatRef.length,
        confidenceDistribution: calculateConfidenceDistribution(scoredPredictions)
    };

    return {
        recommendation,
        analysis,
        referenceStats
    };
}

// Helper Functions

/**
 * Menghitung skor prioritas multifaktor
 */
function calculatePriorityScore(pred: CombinedPrediction, totalCases: number): number {
  // Faktor dasar
  let score = pred.percent * 0.7; // Bobot utama dari probabilitas gabungan

  // Penyesuaian berdasarkan confidence
  const confidenceFactor = {
    'High': 1.2,
    'Medium': 1.0,
    'Low': 0.8
  }[pred.confidence] || 1.0;

  // Penyesuaian berdasarkan jumlah data
  const dataFactor = Math.min(1, (pred.upgradeCases + pred.substatCases) / 10);

  // Bonus untuk substat kritis
  const isCritical = ['CRIT Rate', 'CRIT DMG'].includes(pred.name);
  const criticalBonus = isCritical ? 1.15 : 1.0;

  return score * confidenceFactor * dataFactor * criticalBonus;
}

/**
 * Generate rekomendasi berbasis bahasa natural
 */
function generateRecommendationText(
  best: CombinedPrediction,
  second: CombinedPrediction,
  totalCases: number,
  upgradeCases: number,
  substatCases: number
): AIRecommendation {
  // Template dasar
  let recommendation = `Berdasarkan analisis ${totalCases} kasus upgrade (${upgradeCases} main stat, ${substatCases} substat):\n\n`;
  recommendation += `✨ **Rekomendasi Utama**: ${best.name} (${best.percent}%)\n`;
  recommendation += `   - Confidence: ${best.confidence}\n`;
  recommendation += `   - Prediksi Main Stat: ${best.percentUpgrade}%\n`;
  recommendation += `   - Prediksi Substat: ${best.percentSubstat}%\n`;

  // Tambahkan alternatif jika relevan
  if (second.priorityScore > 30 && second.percent >= 15) {
    recommendation += `\n🔹 **Alternatif Layak**: ${second.name} (${second.percent}%)`;
  }

  // Tambahkan catatan khusus
  if (totalCases < 10) {
    recommendation += `\n\n⚠️ Catatan: Data historis terbatas (<10 kasus). Rekomendasi mungkin kurang akurat.`;
  } else if (best.confidence === 'Low') {
    recommendation += `\n\nℹ️ Tips: Pertimbangkan untuk menggunakan fodder dengan substat ${best.name} yang lebih dominan.`;
  }

  // Sertakan strategi upgrade
  recommendation += generateUpgradeStrategy(best, totalCases);

  return {
    text: recommendation,
    bestSubstat: best.name,
    bestProbability: best.percent,
    confidence: best.confidence as 'High' | 'Medium' | 'Low'
  };
}

/**
 * Generate strategi upgrade spesifik
 */
function generateUpgradeStrategy(bestPred: CombinedPrediction, totalCases: number): string {
  const strategies: Record<string, string> = {
    'CRIT Rate': `\n\n💡 **Strategi CRIT Rate**: Fokuskan pada fodder dengan 2+ substat CRIT. Idealnya kombinasi dengan CRIT DMG.`,
    'CRIT DMG': `\n\n💡 **Strategi CRIT DMG**: Gunakan artifact fodder dengan main stat CRIT DMG atau ATK% untuk hasil optimal.`,
    'ATK%': `\n\n💡 **Strategi ATK%**: Efektif dengan fodder yang memiliki substat ${totalCases < 15 ? 'ATK% + CRIT' : 'Elemental Mastery + CRIT'}.`,
    'Elemental Mastery': `\n\n💡 **Strategi EM**: Lebih konsisten dengan fodder yang memiliki substat Energy Recharge.`
  };

  return strategies[bestPred.name] || `\n\n💡 **Strategi Umum**: Gunakan fodder dengan substat ${bestPred.name} di slot pertama atau kedua.`;
}

/**
 * Hitung distribusi confidence
 */
function calculateConfidenceDistribution(predictions: { confidence: string }[]): {
  high: number;
  medium: number;
  low: number;
} {
  const counts = { high: 0, medium: 0, low: 0 };
  predictions.forEach(p => {
    counts[p.confidence.toLowerCase() as keyof typeof counts]++;
  });
  return counts;
}

// Type Definitions
interface AIRecommendation {
  text: string;
  bestSubstat: string;
  bestProbability: number;
  confidence: 'High' | 'Medium' | 'Low';
}

interface SubstatAnalysis {
  substat: string;
  combinedProbability: number;
  upgradeProbability: number;
  substatProbability: number;
  confidence: string;
  priorityScore: number;
  upgradeCases: number;
  substatCases: number;
}

interface ReferenceStats {
  totalCases: number;
  upgradeCases: number;
  substatCases: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

// ==================== UI FUNCTIONS ====================
// 1. Substat Management
function addSubStat(substat: string) {
    if (modelSubstat.value.length < 4 && !modelSubstat.value.includes(substat)) {
        modelSubstat.value = [...modelSubstat.value, substat]
    }
}

function removeSubStat(index: number) {
    modelSubstat.value.splice(index, 1)
}

function addSubStatX(substat: string) {
    if (modelSubstatX.value.length < 4 && !modelSubstatX.value.includes(substat)) {
        modelSubstatX.value = [...modelSubstatX.value, substat]
    }
}

function removeSubStatX(index: number) {
    modelSubstatX.value.splice(index, 1)
}

// 2. Form Navigation
function actionForms() {
    switch (formActive.value) {
        case 'sample&fodder':
        if (validateInputs()) {
            startSimulate()
            formActive.value = 'results'
        }
        break
        case 'results':
        formActive.value = 'feedback'
        break
        case 'feedback':
        if (modelFeedback.value) {
            sendFeedback()
            resetForm()
            formActive.value = 'sample&fodder'
        }
        break
    }
}

function validateInputs(): boolean {
    return !!modelMainStat.value && 
        modelSubstat.value.length > 0 &&
        !!modelMainStatX.value && 
        modelSubstatX.value.length > 0
}

// 3. Data Handling
function sendFeedback() {
    const newData: HistoricalData = {
        upgradedArtifact: {
            mainStat: modelMainStat.value,
            subStats: modelSubstat.value
        },
        fodderArtifact: {
            mainStat: modelMainStatX.value,
            subStats: modelSubstatX.value
        },
        upgradedSubStat: modelFeedback.value
    }

    if (!isDuplicate(newData)) {
        databaseArtifact.value = [...databaseArtifact.value, newData]
        localStorage.setItem('database', JSON.stringify(databaseArtifact.value))
    }
}

function isDuplicate(newData: HistoricalData): boolean {
    return databaseArtifact.value.some(data =>
        data.upgradedArtifact.mainStat === newData.upgradedArtifact.mainStat &&
        data.fodderArtifact.mainStat === newData.fodderArtifact.mainStat &&
        data.upgradedSubStat === newData.upgradedSubStat &&
        JSON.stringify(data.upgradedArtifact.subStats) === JSON.stringify(newData.upgradedArtifact.subStats) &&
        JSON.stringify(data.fodderArtifact.subStats) === JSON.stringify(newData.fodderArtifact.subStats)
    )
}

// 4. Main Simulation
function startSimulate() {
    const upgradedArtifact: Artifact = {
        mainStat: modelMainStat.value,
        subStats: modelSubstat.value
    }

    const fodderArtifact: Artifact = {
        mainStat: modelMainStatX.value,
        subStats: modelSubstatX.value
    }

    const combined = predictAndCombine(upgradedArtifact, fodderArtifact, databaseArtifact.value)
    const aiResult = generateAIRecommendation(combined)
    console.log(aiResult);

    finalResult.value = aiResult.predictions
    AIRecomendation.value = aiResult.recommendation.explanation
    saveLastInputDataSimulate()
}

// 5. Utility Functions
function resetForm() {
    modelMainStat.value = ''
    modelSubstat.value = []
    modelMainStatX.value = ''
    modelSubstatX.value = []
    modelFeedback.value = ''
}

function saveLastInputDataSimulate() {
    const data = {
        upgradedArtifact: {
            mainStat: modelMainStat.value,
            subStats: modelSubstat.value
        },
        fodderArtifact: {
            mainStat: modelMainStatX.value,
            subStats: modelSubstatX.value
        }
    }
    localStorage.setItem('lastInput', JSON.stringify(data))
}

// 6. Initialization
onMounted(() => {
    const lastInput = localStorage.getItem('lastInput')
    if (lastInput) {
        const data = JSON.parse(lastInput)
        modelMainStat.value = data.upgradedArtifact.mainStat
        modelSubstat.value = data.upgradedArtifact.subStats
        modelMainStatX.value = data.fodderArtifact.mainStat
        modelSubstatX.value = data.fodderArtifact.subStats
    }
})

// Watch Handlers
watch(mainStatsActive, (newVal) => {
    modelMainStat.value = newVal?.name || ''
})

watch(mainStatsActiveX, (newVal) => {
    modelMainStatX.value = newVal?.name || ''
})
</script>

<template>
    <h2 class="text-lg font-semibold">Enchant Artifact</h2>
    <div class="mt-10 space-y-8">
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Sample & Fodder</h3>
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
                <!-- <BarChart
                    index="name"
                    :data="finalResult"
                    :categories="['percent', 'alternative']"
                    :y-formatter="(tick, i) => {
                    return typeof tick === 'number'
                        ? `${tick}%`
                        : ''
                    }"
                    :rounded-corners="8"
                /> -->

                {{ finalResult }}
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