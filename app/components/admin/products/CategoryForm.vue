<template>
    <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
        <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>
                    {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
                </DialogTitle>
                <DialogDescription>
                    {{ isEditing ? 'Ubah informasi kategori produk' : 'Buat kategori produk baru untuk mengorganisir produk Anda' }}
                </DialogDescription>
            </DialogHeader>

            <form @submit="onSubmit" class="space-y-6">
                <FormField v-slot="{ componentField }" name="name">
                    <FormItem>
                        <FormLabel>Nama Kategori</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="Masukkan nama kategori"
                                v-bind="componentField"
                                @input="handleNameInput"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="slug">
                    <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="otomatis-dari-nama"
                                v-bind="componentField"
                                readonly
                                class="font-mono text-sm bg-muted"
                            />
                        </FormControl>
                        <FormDescription>
                            Slug akan dibuat otomatis dari nama kategori dan tidak dapat diedit.
                        </FormDescription>
                        <!-- <FormMessage /> -->
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="description">
                    <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Masukkan deskripsi kategori (opsional)"
                                class="resize-none"
                                v-bind="componentField"
                                rows="3"
                            />
                        </FormControl>
                        <FormDescription>
                        Deskripsi singkat tentang kategori produk ini
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ value, handleChange }" name="isActive">
                    <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div class="space-y-0.5">
                            <FormLabel class="text-base font-medium">
                                Status Kategori
                            </FormLabel>
                            <FormDescription>
                                {{ value ? 'Kategori ini aktif dan dapat digunakan' : 'Kategori ini tidak aktif dan disembunyikan' }}
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                :model-value="value"
                                @update:model-value="handleChange"
                            />
                        </FormControl>
                    </FormItem>
                </FormField>

                <DialogFooter class="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        @click="handleCancel"
                        :disabled="isSubmitting"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                        class="min-w-[100px]"
                    >
                        <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                        {{ isEditing ? 'Simpan Perubahan' : 'Tambah Kategori' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { Loader2 } from 'lucide-vue-next'
import slugify from 'slugify'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { CategoryFormData } from '~/types'

// Props & Emits
interface Props {
    open: boolean
    category?: any | null
    isSubmitting?: boolean
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'submit', data: CategoryFormData): void
    (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
    category: null,
    isSubmitting: false,
})

const emit = defineEmits<Emits>()

// Form Schema
const formSchema = toTypedSchema(z.object({
    name: z.string()
        .min(2, 'Nama kategori minimal 2 karakter')
        .max(100, 'Nama kategori maksimal 100 karakter')
        .regex(/^[a-zA-Z0-9\s\-_&()]+$/, 'Nama kategori hanya boleh mengandung huruf, angka, spasi, dan karakter khusus tertentu'),
    
    slug: z.string()
        .min(2, 'Slug minimal 2 karakter')
        .max(100, 'Slug maksimal 100 karakter')
        .regex(/^[a-z0-9\-]+$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung'),
    
    description: z.string().optional(),
    
    isActive: z.boolean(),
}))

// Computed
const isEditing = computed(() => !!props.category?.id)

// Form setup
const defaultValues: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    isActive: true,
}
const form = useForm({
    initialValues: defaultValues,
    validationSchema: formSchema,
})

// Watch for category changes and reset form
watch(() => props.category, (newCategory) => {
    if (newCategory) {
        // Edit mode - populate form with category data
        const slug = newCategory.slug || generateSlug(newCategory.name || '')
            form.setValues({
            name: newCategory.name || '',
            slug: slug,
            description: newCategory.description || '',
            isActive: Boolean(newCategory.isActive),
        })
    } else {
        // Create mode - reset form
        form.setValues({
            name: '',
            slug: '',
            description: '',
            isActive: true,
        })
    }
}, { immediate: true })

// Watch for dialog open/close and reset form when closed
watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        form.resetForm()
    }
})

// Methods
const generateSlug = (name: string): string => {
    return slugify(name, {
        lower: true,
        strict: true,
        locale: 'id'
    })
}

const handleNameInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const name = target.value
    
    // Update name field
    form.setFieldValue('name', name)
    
    // Always auto-generate slug from name
    if (name.trim()) {
        const generatedSlug = generateSlug(name)
        form.setFieldValue('slug', generatedSlug)
    } else {
        form.setFieldValue('slug', '')
    }
}

const onSubmit = form.handleSubmit((values) => {
    emit('submit', values as CategoryFormData)
})

const handleCancel = () => {
    emit('cancel')
    emit('update:open', false)
}

// Expose form methods for parent component
defineExpose({
    form,
    resetForm: () => form.resetForm(),
    setValues: (values: Partial<CategoryFormData>) => form.setValues(values),
})
</script>