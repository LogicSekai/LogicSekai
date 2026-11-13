<template>
  <div class="relative w-full h-full">
    <div ref="el" class="absolute inset-0 z-0" :class="{ 'cursor-crosshair': pickMode }" />
    <button
      type="button"
      class="absolute right-3 bottom-3 z-[500] px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-wider text-gray-700 dark:text-gray-200 shadow"
      @click="fitAll(true)"
    >
      Pusatkan
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { REPORT_META, type ConvoyDest, type ConvoyMemberLive, type ConvoyReport } from '~/composables/useConvoyLive'

const props = defineProps<{
  members: ConvoyMemberLive[]
  reports: ConvoyReport[]
  destination: ConvoyDest | null
  you: string | null
  pickMode?: boolean
  colorOf: (userId: string) => string
}>()
const emit = defineEmits<{ pick: [lat: number, lng: number]; selectReport: [id: string] }>()

const el = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const memberMarkers = new Map<string, L.Marker>()
const reportMarkers = new Map<string, L.Marker>()
let destMarker: L.Marker | null = null
let fittedOnce = false

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

function memberIcon(m: ConvoyMemberLive) {
  const color = props.colorOf(m.userId)
  const initial = esc((m.profile.name || m.profile.username || '?').trim().charAt(0).toUpperCase())
  const bearing = m.pos?.bearing ?? 0
  const moving = (m.pos?.spd ?? 0) > 1
  const isYou = m.userId === props.you
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="position:relative;width:36px;height:36px">
      ${moving ? `<div style="position:absolute;left:50%;top:50%;width:0;height:0;transform:translate(-50%,-50%) rotate(${bearing}deg)"><div style="position:absolute;left:-6px;top:-27px;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${color}"></div></div>` : ''}
      <div style="position:absolute;inset:4px;border-radius:9999px;background:${color};border:3px solid ${isYou ? '#111827' : '#fff'};box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font:800 12px/1 system-ui,sans-serif">${initial}</div>
    </div>`,
  })
}

function reportIcon(r: ConvoyReport) {
  const meta = REPORT_META[r.type] ?? REPORT_META.hazard
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:8px;background:#fff;border:2px solid ${meta.color};box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:16px">${meta.emoji}</div>`,
  })
}

const destIcon = L.divIcon({
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 32],
  html: '<div style="font-size:30px;line-height:34px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">🏁</div>',
})

function syncMembers() {
  if (!map) return
  const seen = new Set<string>()
  for (const m of props.members) {
    if (!m.pos || m.ghost) continue
    seen.add(m.userId)
    const ll: L.LatLngExpression = [m.pos.lat, m.pos.lng]
    const label = esc(m.profile.name || m.profile.username)
    const existing = memberMarkers.get(m.userId)
    if (existing) {
      existing.setLatLng(ll)
      existing.setIcon(memberIcon(m))
    } else {
      const mk = L.marker(ll, { icon: memberIcon(m), zIndexOffset: 1000 })
        .bindTooltip(label, { direction: 'top', offset: [0, -16] })
        .addTo(map)
      memberMarkers.set(m.userId, mk)
    }
  }
  for (const [uid, mk] of memberMarkers) if (!seen.has(uid)) { mk.remove(); memberMarkers.delete(uid) }
  if (!fittedOnce && seen.size) { fittedOnce = true; fitAll(false) }
}

function syncReports() {
  if (!map) return
  const seen = new Set<string>()
  for (const r of props.reports) {
    seen.add(r.id)
    if (!reportMarkers.has(r.id)) {
      const meta = REPORT_META[r.type] ?? REPORT_META.hazard
      const mk = L.marker([r.lat, r.lng], { icon: reportIcon(r) })
        .bindTooltip(esc(meta.label + (r.note ? ` — ${r.note}` : '')), { direction: 'top', offset: [0, -14] })
        .on('click', () => emit('selectReport', r.id))
        .addTo(map)
      reportMarkers.set(r.id, mk)
    }
  }
  for (const [id, mk] of reportMarkers) if (!seen.has(id)) { mk.remove(); reportMarkers.delete(id) }
}

function syncDest() {
  if (!map) return
  const d = props.destination
  if (!d) { destMarker?.remove(); destMarker = null; return }
  if (destMarker) destMarker.setLatLng([d.lat, d.lng])
  else destMarker = L.marker([d.lat, d.lng], { icon: destIcon, zIndexOffset: 500 }).addTo(map)
  destMarker.unbindTooltip().bindTooltip(esc(d.name || 'Tujuan bersama'), { direction: 'top', offset: [0, -30] })
}

function fitAll(animate: boolean) {
  if (!map) return
  const pts: L.LatLngExpression[] = []
  for (const m of props.members) if (m.pos && !m.ghost) pts.push([m.pos.lat, m.pos.lng])
  if (props.destination) pts.push([props.destination.lat, props.destination.lng])
  if (!pts.length) return
  if (pts.length === 1) map.setView(pts[0]!, 15, { animate })
  else map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 16, animate })
}

function focus(lat: number, lng: number) {
  map?.setView([lat, lng], Math.max(map.getZoom(), 15))
}
defineExpose({ fitAll, focus })

onMounted(() => {
  if (!el.value) return
  map = L.map(el.value, { zoomControl: true, attributionControl: true }).setView([-6.2, 106.816], 11)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map)
  map.on('click', (e: L.LeafletMouseEvent) => { if (props.pickMode) emit('pick', e.latlng.lat, e.latlng.lng) })
  syncMembers(); syncReports(); syncDest()
  // Ukuran kontainer bisa berubah setelah layout selesai
  setTimeout(() => map?.invalidateSize(), 200)
})

onBeforeUnmount(() => { map?.remove(); map = null })

watch(() => props.members, syncMembers, { deep: true })
watch(() => props.reports, syncReports, { deep: true })
watch(() => props.destination, syncDest, { deep: true })
</script>
