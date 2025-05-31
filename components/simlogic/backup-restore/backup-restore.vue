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
            localStorage.setItem('databaseAAA', event.target?.result as string);
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
    <h2 class="text-lg font-semibold">Backup & Restore</h2>
    <div class="mt-10 space-y-8">
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Backup database</h3>
            <div class="bg-gray-200 rounded-lg py-2 px-4 w-fit">{{ filename }} - {{ filesize }}</div>
            <div class="relative">
                <Progress :class="progressDownload > 0 && progressDownload < 100 ? 'opacity-100' : 'opacity-0'" :model-value="progressDownload" class="absolute top-0 left-0 right-0" />
            </div>
            <Button class="bg-gray-800 hover:bg-gray-600 rounded-lg" @click="downloadFile">
                <Download />
                <span>Download</span>
            </Button>
        </div>
    </div>
    <div class="mt-10 space-y-8">
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Restore database</h3>
            <template v-if="selectedFile">
                <div class="bg-gray-200 rounded-lg py-2 px-4 w-fit">{{ selectedFile.name }}</div>
                <div class="relative">
                    <Progress :class="progressRestore > 0 && progressRestore < 100 ? 'opacity-100' : 'opacity-0'" :model-value="progressRestore" class="absolute top-0 left-0 right-0" />
                </div>
            </template>
            <input type="file" accept=".json" ref="htmlInputFile" @change="handleFileSelect" hidden>
            <!-- <div class="flex gap-4"> -->
                <Button class="text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg" @click="selectFile">
                    <Upload />
                    <span>Select file</span>
                </Button>
                <Button v-if="showButtonRestore" class="ml-4 bg-gray-800 hover:bg-gray-600 rounded-lg" @click="restoreDatabase">
                    <Wrench />
                    <span>Select file</span>
                </Button>
            <!-- </div> -->
        </div>
    </div>
</template>