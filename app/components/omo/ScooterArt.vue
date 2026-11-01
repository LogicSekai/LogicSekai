<template>
  <!-- SVG port of OmoAuto's ScooterArt (core/designsystem/.../ScooterArt.kt) -->
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="50" cy="93" rx="42" ry="3" fill="#000" fill-opacity="0.1" />
    <path :fill="body" d="M10 60 Q12 42 34 44 L46 46 L52 64 L70 64 Q74 70 66 72 L16 72 Q8 70 10 60 Z" />
    <rect x="16" y="37" width="28" height="7" rx="4" :fill="screen" />
    <g :stroke="body" stroke-linecap="round" fill="none">
      <line x1="60" y1="66" x2="72" y2="24" stroke-width="5.6" />
      <line x1="72" y1="24" x2="78" y2="78" stroke-width="4.2" />
      <line x1="62" y1="20" x2="84" y2="22" stroke-width="4.55" />
    </g>
    <rect x="63" y="27" width="17" height="10" rx="2.5" :fill="screen" />
    <rect x="65.5" y="29.5" width="8" height="5" rx="1.5" :fill="accent" />
    <circle cx="80" cy="36" r="3" fill="#FFE08A" />
    <g v-for="x in [24, 78]" :key="x">
      <circle :cx="x" cy="78" r="15" :fill="screen" />
      <circle :cx="x" cy="78" r="6.75" :fill="body" />
      <circle :cx="x" cy="78" r="2.7" :fill="accent" />
    </g>
    <g :stroke="body" stroke-opacity="0.6" stroke-width="2.45" stroke-linecap="round">
      <line x1="0" y1="50" x2="7" y2="50" />
      <line x1="2" y1="58" x2="7" y2="58" />
    </g>
    <g :stroke="body" stroke-width="2.45" stroke-linecap="round" fill="none">
      <path d="M68.82 12.75 A3.5 3.5 0 0 1 74.18 12.75" />
      <path d="M66.14 10.5 A7 7 0 0 1 76.86 10.5" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ body?: string; accent?: string; screen?: string }>(), {
  body: '#FFFFFF',
  accent: '#FF7A4F',
  screen: '#3C467D',
})
</script>
