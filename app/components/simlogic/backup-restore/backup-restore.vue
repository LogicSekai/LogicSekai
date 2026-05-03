<script setup lang="ts">
import { Download, Upload, Wrench } from 'lucide-vue-next';
const databaseArtifact = ref<[]>(JSON.parse(localStorage.getItem('database') || '[]'));
const progressDownload = ref(0);

const htmlInputFile = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const showButtonRestore = ref(false);
const progressRestore = ref(0);

const filename = computed(() => {
    const date = new Date();
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `simlogic-${year}${month}${day}${hours}${minutes}${seconds}.json`;
});

const filesize = computed(() => {
    const jsonString = JSON.stringify(databaseArtifact.value);
    const sizeNum = new Blob([jsonString]).size;
    let sizeStr = sizeNum.toString();
    let unit = 'Bytes';
    if (sizeNum > 1024) {
        sizeStr = (sizeNum / 1024).toFixed(2);
        unit = 'KB';
    }
    if (sizeNum > 1024 * 1024) {
        sizeStr = (sizeNum / (1024 * 1024)).toFixed(2);
        unit = 'MB';
    }
    if (sizeNum > 1024 * 1024 * 1024) {
        sizeStr = (sizeNum / (1024 * 1024 * 1024)).toFixed(2);
        unit = 'GB';
    }
    return `${sizeStr} ${unit}`;
});

function downloadFile() {
    const jsonString = JSON.stringify(databaseArtifact.value);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.value;
    const intervalId = setInterval(() => {
        progressDownload.value = Math.min(progressDownload.value + 1, 100);
        if (progressDownload.value === 100) {
            clearInterval(intervalId);
            link.click();
            URL.revokeObjectURL(url);
            progressDownload.value = 0;
        }
    }, 20);
}

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0];
    }
}

function selectFile() {
    htmlInputFile.value?.click();
}

function restoreDatabase() {
    if (selectedFile.value) {
        const reader = new FileReader();
        reader.onload = (event) => {
            localStorage.setItem('database', event.target?.result as string);
            const intervalId = setInterval(() => {
                progressRestore.value = Math.min(progressRestore.value + 1, 100);
                if (progressRestore.value === 100) {
                    clearInterval(intervalId);
                    progressRestore.value = 0;
                    showButtonRestore.value = false;
                }
            }, 20);
        };
        reader.readAsText(selectedFile.value);
    }
}

watch(selectedFile, () => {
    if (selectedFile.value) {
        showButtonRestore.value = true;
    }
});
</script>

<template>
    <!-- Header bar -->
    <div class="border-b border-gray-100 dark:border-white/6 px-6 py-4">
        <p class="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-0.5">// DATA</p>
        <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-sm">Backup & Restore</h2>
    </div>

    <div class="flex-1 px-6 py-6 space-y-0 divide-y divide-gray-100 dark:divide-white/6">

        <!-- Backup section -->
        <div class="pb-8 space-y-4">
            <div class="pt-1">
                <p class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400 mb-1">Backup Database</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Unduh seluruh data simulasi sebagai file JSON.</p>
            </div>

            <div class="flex items-center gap-3 px-4 py-3 border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                <span class="font-mono text-[0.6rem] tracking-widest text-gray-700 dark:text-gray-300 truncate flex-1">{{ filename }}</span>
                <span class="shrink-0 font-mono text-[0.55rem] tracking-[0.12em] uppercase text-gray-400 dark:text-gray-600">{{ filesize }}</span>
            </div>

            <!-- Progress bar -->
            <div v-if="progressDownload > 0 && progressDownload < 100" class="h-px bg-gray-100 dark:bg-white/6 overflow-hidden">
                <div class="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-75" :style="{ width: `${progressDownload}%` }" />
            </div>

            <button
                @click="downloadFile"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-mono uppercase tracking-[0.12em] hover:opacity-80 transition-opacity"
            >
                <Download class="h-3.5 w-3.5" />
                <span>Download</span>
            </button>
        </div>

        <!-- Restore section -->
        <div class="pt-8 space-y-4">
            <div>
                <p class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400 mb-1">Restore Database</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Pilih file JSON backup untuk memulihkan data simulasi.</p>
            </div>

            <div v-if="selectedFile" class="flex items-center gap-3 px-4 py-3 border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                <span class="font-mono text-[0.6rem] tracking-widest text-gray-700 dark:text-gray-300 truncate flex-1">{{ selectedFile.name }}</span>
            </div>

            <!-- Progress bar -->
            <div v-if="progressRestore > 0 && progressRestore < 100" class="h-px bg-gray-100 dark:bg-white/6 overflow-hidden">
                <div class="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-75" :style="{ width: `${progressRestore}%` }" />
            </div>

            <input type="file" accept=".json" ref="htmlInputFile" @change="handleFileSelect" hidden>

            <div class="flex items-center gap-3">
                <button
                    @click="selectFile"
                    class="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-mono uppercase tracking-[0.12em] hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Upload class="h-3.5 w-3.5" />
                    <span>Pilih File</span>
                </button>

                <button
                    v-if="showButtonRestore"
                    @click="restoreDatabase"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-mono uppercase tracking-[0.12em] hover:opacity-80 transition-opacity"
                >
                    <Wrench class="h-3.5 w-3.5" />
                    <span>Restore</span>
                </button>
            </div>
        </div>

    </div>

    <!-- Footer -->
    <div class="border-t border-gray-100 dark:border-white/6 px-6 py-3">
        <span class="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-gray-400 dark:text-gray-600">
            Data tersimpan lokal di browser
        </span>
    </div>
</template>