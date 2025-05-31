<script setup lang="ts">
definePageMeta({
    layout: 'empty'
})

import { AlignStartVertical, Dices, SquareStack, FolderSync } from 'lucide-vue-next';
import { Button } from '~/components/ui/button';

// Import Tools
import SimlogicSimulate from '~/components/simlogic/simulate/simulate.vue'
import SimlogicBackupRestore from '~/components/simlogic/backup-restore/backup-restore.vue'
import SimlogicHistory from '~/components/simlogic/history/history.vue';

const contentActive = ref('simulate')
const mobileNavShow = ref(false)

watch(contentActive, () => {
    if (mobileNavShow.value) mobileNavShow.value = false
})
</script>

<template>
    <div class="flex lg:hidden items-center fixed top-7 right-7 z-50">
        <button @click="mobileNavShow = !mobileNavShow" class="inline-flex items-center justify-center p-2 rounded-md focus:outline-none" aria-label="Main menu">
            <span class="sr-only">Open main menu</span>
            <div class="space-y-1.5">
                <span :class="mobileNavShow ? 'rotate-45 translate-y-2' : ''" class="block h-0.5 w-6 bg-gray-800 dark:bg-white transition-transform duration-300"></span>
                <span :class="mobileNavShow ? 'opacity-0' : 'opacity-100'" class="block h-0.5 w-6 bg-gray-800 dark:bg-white transition-opacity duration-300"></span>
                <span :class="mobileNavShow ? '-rotate-45 -translate-y-2' : ''" class="block h-0.5 w-6 bg-gray-800 dark:bg-white transition-transform duration-300"></span>
            </div>
        </button>
    </div>

    <div class="w-full h-screen lg:h-screen bg-gray-200 flex items-center justify-center">
        <div class="w-[1200px] h-screen lg:h-fit bg-gray-100 rounded-3xl lg:p-2 flex">
            <div class="w-full h-full lg:h-[800px] lg:max-w-[400px] flex-1 p-8 flex flex-col fixed lg:relative top-0 left-0 bg-gray-100 z-20 transform lg:translate-x-0"
            :class="[mobileNavShow ? 'translate-x-0' : '-translate-x-full', 'transition-transform duration-300 ease-in-out']">
                <div class="flex items-center">
                    <AlignStartVertical class="w-5 h-5 text-gray-600" />
                    <h1 class="ml-2 text-lg font-semibold">SimLogic - Simulate Artifact Upgrade</h1>
                </div>
                <p class="mt-6 text-gray-500 font-medium">SimLogic adalah alat untuk melakukan analisa peningkatan substat pada artifak genshin, memungkinkan pengguna untuk memprediksi peningkatan substat yang akan terjadi pada artifak dan mengumpulkan umpan balik untuk mengoptimalkan peningkatan.</p>
                <div class="mt-10 grid grid-cols-1 gap-4">
                    <Button :class="contentActive === 'simulate' ? 'bg-gray-200' : 'bg-gray-100'" class="w-full shadow-none rounded-xl text-gray-700 justify-start space-x-3 hover:bg-gray-200" @click="contentActive = 'simulate'">
                        <Dices />
                        <span>Simulate Enhance</span>
                    </Button>
                    <Button :class="contentActive === 'history' ? 'bg-gray-200' : 'bg-gray-100'" class="w-full shadow-none rounded-xl text-gray-700 justify-start space-x-3 hover:bg-gray-200" @click="contentActive = 'history'">
                        <SquareStack />
                        <span>History</span>
                    </Button>
                    <Button :class="contentActive === 'backup-restore' ? 'bg-gray-200' : 'bg-gray-100'" class="w-full shadow-none rounded-xl text-gray-700 justify-start space-x-3 hover:bg-gray-200" @click="contentActive = 'backup-restore'">
                        <FolderSync />
                        <span>Backup & Restore</span>
                    </Button>
                </div>
                <div class="mt-auto mb-0 text-gray-400">
                    <span>&copy; 2021 - 2025 SimLogic</span>
                </div>
            </div>
            <div class="w-full h-full lg:h-[820px] flex-1 p-7 bg-white lg:rounded-3xl lg:border-2 lg:border-gray-200 flex flex-col">
                <SimlogicSimulate v-if="contentActive === 'simulate'" />
                <SimlogicHistory v-if="contentActive === 'history'" />
                <SimlogicBackupRestore v-if="contentActive === 'backup-restore'" />
            </div>
        </div>
    </div>
</template>