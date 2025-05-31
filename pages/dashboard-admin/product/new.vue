<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar } from '~/components/ui/avatar'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'

import Texteditor from '~/components/Texteditor.vue';
import { Trash, Plus, HardDriveUpload, Image } from 'lucide-vue-next';

const pb = usePocketbase()
const { searchQuery: searchName, users: searchResults, isLoading, getUserAvatar } = useUserSearch()

definePageMeta({
    layout: 'dashboard',
    roles: ['admin'],
})

const content = ref('');
const creators = ref<Creators>([]);
const previewImage = ref<string>('')

type Creators = Array<{
    name: string;
    avatar: string;
    role: string;
}>

// Search and add creator
const dialogAddCreator = ref(false)
const rawModelCreator = ref<string[]>([])
const modelCreator = ref<Creators>([])
const modelRole = ref<string>('')
const open = ref(false)


const filteredCreators = computed(() => {
    return searchResults.value
        .filter(user => !rawModelCreator.value.includes(user.name))
})

watch(searchName, (newVal) => {
    if (newVal.trim() !== '') {
        open.value = true
    }
})

function handleAddCreators() {
    modelCreator.value = modelCreator.value.map(i => ({ ...i, role: modelRole.value }))
    creators.value.push(...modelCreator.value)
    rawModelCreator.value = []
    modelCreator.value = []
    modelRole.value = ''
    dialogAddCreator.value = false
}

function handleRemoveCreator(index: number) {
    creators.value.splice(index, 1)
}
</script>

<template>
    <h2 class="text-3xl font-bold tracking-tight">
        Dashboard
    </h2>

    <div class="grid grid-cols-4 gap-4">
        <div class="col-span-3 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Judul Produk</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input type="email" class="h-12 text-lg font-semibold" placeholder="Judul..." />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Deskripsi Produk</CardTitle>
                </CardHeader>
                <CardContent>
                    <Texteditor v-model="content" />
                </CardContent>
            </Card>
        </div>

        <div class="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col items-center justify-center">
                        <div class="w-full flex aspect-video bg-gray-100 border-dashed border-2 rounded-lg">
                            <div v-if="!previewImage" class="flex flex-col items-center justify-center m-auto">
                                <div class="text-center">
                                    <p class="text-sm font-semibold text-gray-500">Seret file gambar Anda ke sini</p>
                                    <p class="text-gray-500 text-xs">atau</p>
                                    <input class="hidden" type="file" ref="fileInputRef" accept="image/*" @change=""/>
                                    <Button variant="outline" size="sm" class="mt-2 text-primary" @click="">
                                        <HardDriveUpload />
                                        <span>Unggah dari perangkat</span>
                                    </Button>
                                    <p class="text-gray-500 font-light text-xs mt-2">Format JPG, PNG, atau GIF - Max 5MB</p>
                                </div>
                            </div>
                            <div v-else class="relative m-auto">
                                <div class="absolute top-2 right-2 z-10 space-x-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <input class="hidden" type="file" ref="fileInputRef" accept="image/*" @change=""/>
                                                <Button variant="outline" size="icon" @click="">
                                                    <Image />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Ubah gambar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button variant="outline" size="icon" @click="previewImage = ''">
                                                    <Trash />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Hapus</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <img :src="previewImage" alt="Pratinjau Gambar" class="w-full h-full object-cover rounded-lg">
                            </div>
                        </div>
                    </div>
                    <!-- <input type="file" class="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" /> -->
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Creator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col space-y-4">
                        <div v-for="(creator, index) in creators" :key="index" class="flex items-center gap-4">
                            <img :src="!creator.avatar ? '/img/avatar.png' : getUserAvatar(creator)" alt="Creator Avatar" class="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <h4 class="text-lg font-medium text-dark dark:text-white">{{ creator.name }}</h4>
                                <p class="text-sm text-body-color dark:text-body-color-2">creator.role</p>
                            </div>
                            <div class="ml-auto">
                                <Button size="icon" variant="destructive" @click="handleRemoveCreator(index)">
                                    <Trash />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <Dialog v-model:open="dialogAddCreator">
                            <DialogTrigger as-child>
                                <Button variant="outline" class="w-full">
                                    <Plus />
                                    Add Creator
                                </Button>
                            </DialogTrigger>
                            <DialogContent class="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tambahkan tim</DialogTitle>
                                    <DialogDescription>
                                        Cari dan mention tim yang ingin anda tambahkan
                                    </DialogDescription>
                                </DialogHeader>
                                <div class="grid gap-4 py-4">
                                    <div>
                                        <Label for="role">
                                            Peran/Tugas
                                        </Label>
                                        <Input id="role" v-model="modelRole" />
                                    </div>
                                    <div>
                                        <Label for="name">
                                            Tim
                                        </Label>
                                        <Combobox v-model="rawModelCreator" v-model:open="open" :ignore-filter="true">
                                            <ComboboxAnchor as-child>
                                            <TagsInput v-model="rawModelCreator" class="px-2 gap-2 w-full">
                                                <div class="flex gap-2 flex-wrap items-center">
                                                <TagsInputItem v-for="item in rawModelCreator" :key="item" :value="item">
                                                    <TagsInputItemText />
                                                    <TagsInputItemDelete />
                                                </TagsInputItem>
                                                </div>
    
                                                <ComboboxInput v-model="searchName" as-child>
                                                <TagsInputInput placeholder="Search to mention..." class="min-w-[200px] w-full p-0 border-none focus-visible:ring-0 h-auto" @keydown.enter.prevent />
                                                </ComboboxInput>
                                            </TagsInput>
    
                                            <ComboboxList class="w-[--reka-popper-anchor-width]">
                                                <ComboboxEmpty />
                                                <ComboboxGroup>
                                                    <ComboboxItem
                                                        v-for="creator in filteredCreators" :key="creator.name" :value="creator.name"
                                                        @select.prevent="(ev) => {
                                                            if (typeof ev.detail.value === 'string') {
                                                                searchName = ''
                                                                rawModelCreator.push(ev.detail.value)
                                                            }

                                                            modelCreator.push({ ...creator, role: modelRole })
            
                                                            if (filteredCreators.length === 0) {
                                                                open = false
                                                            }
                                                        }">
                                                        <Avatar class="mr-2">
                                                            <AvatarImage :src="!creator.avatar ? '/img/avatar.png' : getUserAvatar(creator)" :alt="creator.name" />
                                                        </Avatar>
                                                        <span>{{ creator.name }}</span>
                                                    </ComboboxItem>
                                                </ComboboxGroup>
                                            </ComboboxList>
                                            </ComboboxAnchor>
                                        </Combobox>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button @click="handleAddCreators">
                                        Tambahkan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>