<script setup lang="ts">
// Recursive SVG diagram node renderer for Regex Visualizer

const props = defineProps<{
    node: any       // LayoutNode
    hoveredId: string | null
}>()
const emit = defineEmits<{ hover: [id: string | null] }>()

const NODE_W = 148, NODE_H = 46

type NodeType =
    | 'sequence' | 'alternation' | 'group' | 'quantifier'
    | 'char' | 'charclass' | 'dot' | 'anchor' | 'escape' | 'backreference'

interface FillDef { fill: string; stroke: string; text: string }
const NODE_FILL: Record<string, FillDef> = {
    char:          { fill: '#f9fafb', stroke: '#e5e7eb',  text: '#1f2937' },
    escape:        { fill: '#eff6ff', stroke: '#bfdbfe',  text: '#1d4ed8' },
    anchor:        { fill: '#f5f3ff', stroke: '#ddd6fe',  text: '#5b21b6' },
    dot:           { fill: '#f0fdf4', stroke: '#bbf7d0',  text: '#15803d' },
    charclass:     { fill: '#fff7ed', stroke: '#fed7aa',  text: '#c2410c' },
    group:         { fill: '#eef2ff', stroke: '#c7d2fe',  text: '#3730a3' },
    quantifier:    { fill: '#fdf4ff', stroke: '#e9d5ff',  text: '#7e22ce' },
    alternation:   { fill: '#fff1f2', stroke: '#fecdd3',  text: '#be123c' },
    sequence:      { fill: '#f8fafc', stroke: '#e2e8f0',  text: '#475569' },
    backreference: { fill: '#ecfdf5', stroke: '#a7f3d0',  text: '#065f46' },
}

function getFill(type: string) { return (NODE_FILL[type] ?? NODE_FILL.char) }

// Is this a leaf (renders a box)?
function isLeaf(node: any): boolean {
    const t = node.rnode.type as NodeType
    return !['sequence', 'alternation', 'group', 'quantifier'].includes(t)
}

// Truncate label for display
function truncLabel(s: string, max = 18) { return s.length > max ? s.slice(0, max - 1) + '…' : s }

// Midpoint Y of a node
function midY(node: any): number { return node.y + node.h / 2 }
function midX(node: any): number { return node.x + node.w / 2 }
function nodeRightX(node: any): number { return node.x + node.w }
</script>

<template>
    <g>
        <!-- ── SEQUENCE ─────────────────────────────────────────────── -->
        <template v-if="node.rnode.type === 'sequence'">
            <!-- Horizontal connector lines between children -->
            <template v-for="(child, i) in node.children" :key="'sl' + i">
                <line
                    v-if="i < node.children.length - 1"
                    :x1="nodeRightX(child)"
                    :y1="midY(child)"
                    :x2="node.children[i + 1].x"
                    :y2="midY(node.children[i + 1])"
                    stroke="#d1d5db"
                    stroke-width="1.5"
                    marker-end="url(#arrow)"
                />
            </template>
            <ToolsSvgNodes
                v-for="child in node.children"
                :key="child.id"
                :node="child"
                :hovered-id="hoveredId"
                @hover="emit('hover', $event)"
            />
        </template>

        <!-- ── ALTERNATION ───────────────────────────────────────────── -->
        <template v-else-if="node.rnode.type === 'alternation'">
            <!-- Left vertical bar -->
            <line
                :x1="node.x + 8"
                :y1="midY(node.children[0])"
                :x2="node.x + 8"
                :y2="midY(node.children[node.children.length - 1])"
                stroke="#fda4af"
                stroke-width="2"
            />
            <!-- Right vertical bar -->
            <line
                :x1="node.x + node.w - 8"
                :y1="midY(node.children[0])"
                :x2="node.x + node.w - 8"
                :y2="midY(node.children[node.children.length - 1])"
                stroke="#fda4af"
                stroke-width="2"
            />
            <!-- Horizontal branch lines -->
            <template v-for="child in node.children" :key="'al' + child.id">
                <line
                    :x1="node.x + 8"
                    :y1="midY(child)"
                    :x2="child.x"
                    :y2="midY(child)"
                    stroke="#fda4af"
                    stroke-width="1.5"
                    marker-end="url(#arrow)"
                />
                <line
                    :x1="nodeRightX(child)"
                    :y1="midY(child)"
                    :x2="node.x + node.w - 8"
                    :y2="midY(child)"
                    stroke="#fda4af"
                    stroke-width="1.5"
                />
            </template>
            <!-- OR label -->
            <g
                v-for="(child, i) in node.children.slice(0, -1)"
                :key="'or' + i"
            >
                <rect
                    :x="node.x + node.w / 2 - 10"
                    :y="midY(child) + (midY(node.children[i + 1]) - midY(child)) / 2 - 7"
                    width="20" height="14"
                    fill="#fff1f2"
                    stroke="#fecdd3"
                />
                <text
                    :x="node.x + node.w / 2"
                    :y="midY(child) + (midY(node.children[i + 1]) - midY(child)) / 2 + 4"
                    text-anchor="middle"
                    font-size="8"
                    font-family="monospace"
                    fill="#be123c"
                >OR</text>
            </g>
            <ToolsSvgNodes
                v-for="child in node.children"
                :key="child.id"
                :node="child"
                :hovered-id="hoveredId"
                @hover="emit('hover', $event)"
            />
        </template>

        <!-- ── GROUP ─────────────────────────────────────────────────── -->
        <template v-else-if="node.rnode.type === 'group'">
            <!-- Group header box -->
            <rect
                :x="node.x"
                :y="node.y"
                :width="node.w"
                :height="NODE_H"
                :fill="getFill('group').fill"
                :stroke="getFill('group').stroke"
                stroke-width="1.5"
            />
            <!-- Group footer box -->
            <rect
                :x="node.x"
                :y="node.y + node.h - NODE_H"
                :width="node.w"
                :height="NODE_H"
                :fill="getFill('group').fill"
                :stroke="getFill('group').stroke"
                stroke-width="1.5"
            />
            <!-- Side lines -->
            <line
                :x1="node.x + 1"
                :y1="node.y + NODE_H"
                :x2="node.x + 1"
                :y2="node.y + node.h - NODE_H"
                :stroke="getFill('group').stroke"
                stroke-width="1.5"
                stroke-dasharray="4 3"
            />
            <line
                :x1="node.x + node.w - 1"
                :y1="node.y + NODE_H"
                :x2="node.x + node.w - 1"
                :y2="node.y + node.h - NODE_H"
                :stroke="getFill('group').stroke"
                stroke-width="1.5"
                stroke-dasharray="4 3"
            />
            <!-- Group label text -->
            <text
                :x="node.x + node.w / 2"
                :y="node.y + NODE_H / 2 + 4"
                text-anchor="middle"
                font-size="10"
                font-family="monospace"
                font-weight="600"
                :fill="getFill('group').text"
            >{{ truncLabel(node.rnode.label) }}</text>
            <!-- Group kind badge -->
            <text
                :x="node.x + node.w / 2"
                :y="node.y + NODE_H - 7"
                text-anchor="middle"
                font-size="7"
                font-family="monospace"
                :fill="getFill('group').text"
                opacity="0.6"
            >{{ node.rnode.groupKind }}</text>
            <!-- Footer close label -->
            <text
                :x="node.x + node.w / 2"
                :y="node.y + node.h - NODE_H / 2 + 4"
                text-anchor="middle"
                font-size="10"
                font-family="monospace"
                :fill="getFill('group').text"
                opacity="0.5"
            >end group</text>
            <!-- Connector from header to child -->
            <line
                :x1="node.x + node.w / 2"
                :y1="node.y + NODE_H"
                :x2="node.children[0].x + node.children[0].w / 2"
                :y2="node.children[0].y"
                stroke="#c7d2fe"
                stroke-width="1.5"
                marker-end="url(#arrow)"
            />
            <ToolsSvgNodes
                :node="node.children[0]"
                :hovered-id="hoveredId"
                @hover="emit('hover', $event)"
            />
        </template>

        <!-- ── QUANTIFIER ─────────────────────────────────────────────── -->
        <template v-else-if="node.rnode.type === 'quantifier'">
            <!-- Quantifier box -->
            <rect
                :x="node.x"
                :y="node.y"
                :width="Math.max(NODE_W, node.children[0].w)"
                :height="NODE_H"
                :fill="getFill('quantifier').fill"
                :stroke="getFill('quantifier').stroke"
                stroke-width="1.5"
                @mouseenter="emit('hover', node.id)"
                @mouseleave="emit('hover', null)"
                style="cursor: default"
            />
            <text
                :x="node.x + Math.max(NODE_W, node.children[0].w) / 2"
                :y="node.y + NODE_H / 2 + 4"
                text-anchor="middle"
                font-size="10"
                font-family="monospace"
                font-weight="600"
                :fill="getFill('quantifier').text"
            >{{ truncLabel(node.rnode.label) }}</text>
            <!-- Lazy badge -->
            <text
                v-if="node.rnode.lazy"
                :x="node.x + Math.max(NODE_W, node.children[0].w) - 8"
                :y="node.y + 11"
                text-anchor="end"
                font-size="7"
                font-family="monospace"
                fill="#a855f7"
                opacity="0.8"
            >lazy</text>
            <!-- Arrow to child -->
            <line
                :x1="node.x + Math.max(NODE_W, node.children[0].w) / 2"
                :y1="node.y + NODE_H"
                :x2="node.children[0].x + node.children[0].w / 2"
                :y2="node.children[0].y"
                stroke="#d8b4fe"
                stroke-width="1.5"
                marker-end="url(#arrow)"
            />
            <!-- Loop-back arrow for * and + -->
            <path
                v-if="node.rnode.quantMin === 0 || node.rnode.quantMax === Infinity"
                :d="`M ${nodeRightX(node.children[0])} ${midY(node.children[0])}
                     C ${nodeRightX(node.children[0]) + 20} ${midY(node.children[0])},
                       ${node.x + Math.max(NODE_W, node.children[0].w) + 20} ${node.y + NODE_H / 2},
                       ${node.x + Math.max(NODE_W, node.children[0].w)} ${node.y + NODE_H / 2}`"
                fill="none"
                stroke="#d8b4fe"
                stroke-width="1.5"
                stroke-dasharray="4 3"
                marker-end="url(#arrow)"
            />
            <ToolsSvgNodes
                :node="node.children[0]"
                :hovered-id="hoveredId"
                @hover="emit('hover', $event)"
            />
        </template>

        <!-- ── LEAF NODE (char, escape, anchor, dot, charclass, backreference) -->
        <template v-else>
            <g
                @mouseenter="emit('hover', node.id)"
                @mouseleave="emit('hover', null)"
                style="cursor: default"
            >
                <!-- Box shadow on hover -->
                <rect
                    v-if="hoveredId === node.id"
                    :x="node.x - 2"
                    :y="node.y - 2"
                    :width="node.w + 4"
                    :height="NODE_H + 4"
                    fill="none"
                    stroke="#6366f1"
                    stroke-width="2"
                    opacity="0.5"
                />
                <!-- Main box -->
                <rect
                    :x="node.x"
                    :y="node.y"
                    :width="node.w"
                    :height="NODE_H"
                    :fill="getFill(node.rnode.type).fill"
                    :stroke="getFill(node.rnode.type).stroke"
                    stroke-width="1.5"
                />
                <!-- Type badge (top-left tiny) -->
                <rect
                    :x="node.x"
                    :y="node.y"
                    :width="node.w"
                    :height="12"
                    :fill="getFill(node.rnode.type).stroke"
                    opacity="0.5"
                />
                <text
                    :x="node.x + node.w / 2"
                    :y="node.y + 8.5"
                    text-anchor="middle"
                    font-size="6.5"
                    font-family="monospace"
                    letter-spacing="0.05em"
                    :fill="getFill(node.rnode.type).text"
                    text-transform="uppercase"
                >{{ node.rnode.type.toUpperCase() }}</text>
                <!-- Label -->
                <text
                    :x="node.x + node.w / 2"
                    :y="node.y + 31"
                    text-anchor="middle"
                    font-size="11"
                    font-family="monospace"
                    font-weight="600"
                    :fill="getFill(node.rnode.type).text"
                >{{ truncLabel(node.rnode.label) }}</text>
            </g>
        </template>
    </g>
</template>
