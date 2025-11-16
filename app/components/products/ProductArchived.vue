<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Archive, Edit } from 'lucide-vue-next'

const { user } = useAuth()

const props = defineProps<{
    product: any
}>()
</script>

<template>
    <Card v-if="product.status !== 'published' && (product.creator.id === user?.id)" class="mb-6">
        <CardContent>
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <div 
                        class="w-12 h-12 rounded-lg flex items-center justify-center"
                        :class="{
                            'bg-amber-100 dark:bg-amber-900/20': product.status === 'draft',
                            'bg-gray-100 dark:bg-gray-800': product.status === 'archived'
                        }"
                    >
                        <FileText 
                            v-if="product.status === 'draft'"
                            class="w-6 h-6 text-amber-600 dark:text-amber-400"
                        />
                        <Archive 
                            v-else
                            class="w-6 h-6 text-gray-600 dark:text-gray-400"
                        />
                    </div>
                </div>
                
                <div class="flex justify-between w-full">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="font-semibold text-lg">
                                    {{ product.status === 'draft' ? 'Produk dalam Mode Draft' : 'Produk Diarsipkan' }}
                                </h3>
                                <Badge 
                                    :variant="product.status === 'draft' ? 'secondary' : 'outline'"
                                    :class="{
                                        'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400': product.status === 'draft',
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400': product.status === 'archived'
                                    }"
                                >
                                    {{ product.status === 'draft' ? 'Draft' : 'Archived' }}
                                </Badge>
                            </div>
                            <p class="text-sm text-muted-foreground leading-relaxed">
                                {{ product.status === 'draft' 
                                    ? 'Produk ini belum dipublikasikan dan hanya dapat dilihat oleh Anda sebagai creator.' 
                                    : 'Produk ini telah diarsipkan dan tidak ditampilkan di marketplace.' 
                                }}
                            </p>
                        </div>
                    </div>
                    
                    <div class="pt-2">
                        <NuxtLink :href="`/creator/products/${product.id}/edit`">
                            <Button 
                                variant="outline" 
                                size="sm"
                                class="gap-2">
                                <Edit class="w-4 h-4" />
                                Edit Produk
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>