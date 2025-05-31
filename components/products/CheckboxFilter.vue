<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FilterX } from 'lucide-vue-next'

const props = defineProps({
    options: {
        type: Array as PropType<{ id: string; label: string }[]>,
        required: true
    },
    selected: {
        type: Array as PropType<string[]>,
        default: () => []
    },
    title: {
        type: String,
        default: 'Categories'
    }
})

const emit = defineEmits(['update:selected'])

const localSelected = ref<string[]>(props.selected)

const toggleCategory = (categoryId: string) => {
    if (localSelected.value.includes(categoryId)) {
        localSelected.value = localSelected.value.filter(id => id !== categoryId)
    } else {
        localSelected.value = [...localSelected.value, categoryId]
    }
    emitChanges()
}

const resetFilters = () => {
    localSelected.value = []
    emitChanges()
}

const emitChanges = () => {
    emit('update:selected', localSelected.value)
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">{{ title }}</h3>
            <Button 
                v-if="localSelected.length > 0"
                variant="ghost" 
                size="sm" 
                class="h-6 px-2 text-xs"
                @click="resetFilters"
            >
                <FilterX class="mr-1 h-3 w-3" />
                Reset
            </Button>
        </div>

        <div class="space-y-2">
            <div v-for="option in options" :key="option.id" class="flex items-center space-x-2">
                <Checkbox 
                :id="option.id" 
                :checked="localSelected.includes(option.id)"
                @update:checked="() => toggleCategory(option.id)"
                />
                <label
                :for="option.id"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                {{ option.label }}
                </label>
            </div>
        </div>

        <Badge 
        v-if="localSelected.length > 0"
        variant="outline"
        class="flex items-center justify-center gap-1 w-full"
        >
            Selected: {{ localSelected.length }}
        </Badge>
    </div>
</template>