<template>
  <div class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  value?: number
  max?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  class: ''
})
</script>