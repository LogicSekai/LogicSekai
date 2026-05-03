<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-px p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">

      <!-- Heading -->
      <div class="flex items-center gap-px mr-1">
        <button
          v-for="level in [1, 2, 3]"
          :key="level"
          type="button"
          @click="editor?.chain().focus().toggleHeading({ level: level as any }).run()"
          :class="toolbarBtn(editor?.isActive('heading', { level }))"
          :title="`Heading ${level}`"
        >
          <span class="font-mono text-[11px] font-bold">H{{ level }}</span>
        </button>
      </div>

      <div class="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

      <!-- Format -->
      <button type="button" @click="editor?.chain().focus().toggleBold().run()" :class="toolbarBtn(editor?.isActive('bold'))" title="Bold">
        <BoldIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleItalic().run()" :class="toolbarBtn(editor?.isActive('italic'))" title="Italic">
        <ItalicIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" :class="toolbarBtn(editor?.isActive('underline'))" title="Underline">
        <UnderlineIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleStrike().run()" :class="toolbarBtn(editor?.isActive('strike'))" title="Strikethrough">
        <StrikethroughIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleCode().run()" :class="toolbarBtn(editor?.isActive('code'))" title="Inline Code">
        <CodeIcon class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

      <!-- Align -->
      <button type="button" @click="editor?.chain().focus().setTextAlign('left').run()" :class="toolbarBtn(editor?.isActive({ textAlign: 'left' }))" title="Align Left">
        <AlignLeftIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().setTextAlign('center').run()" :class="toolbarBtn(editor?.isActive({ textAlign: 'center' }))" title="Align Center">
        <AlignCenterIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().setTextAlign('right').run()" :class="toolbarBtn(editor?.isActive({ textAlign: 'right' }))" title="Align Right">
        <AlignRightIcon class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

      <!-- Lists -->
      <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" :class="toolbarBtn(editor?.isActive('bulletList'))" title="Bullet List">
        <ListIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" :class="toolbarBtn(editor?.isActive('orderedList'))" title="Ordered List">
        <ListOrderedIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()" :class="toolbarBtn(editor?.isActive('blockquote'))" title="Blockquote">
        <QuoteIcon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().toggleCodeBlock().run()" :class="toolbarBtn(editor?.isActive('codeBlock'))" title="Code Block">
        <SquareCodeIcon class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

      <!-- Link -->
      <button type="button" @click="setLink" :class="toolbarBtn(editor?.isActive('link'))" title="Insert Link">
        <LinkIcon class="w-3.5 h-3.5" />
      </button>
      <button
        v-if="editor?.isActive('link')"
        type="button"
        @click="editor?.chain().focus().unsetLink().run()"
        :class="toolbarBtn(false)"
        title="Remove Link"
      >
        <UnlinkIcon class="w-3.5 h-3.5" />
      </button>

      <!-- Image -->
      <button type="button" @click="insertImage" :class="toolbarBtn(false)" title="Insert Image">
        <ImageIcon class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

      <!-- HR -->
      <button type="button" @click="editor?.chain().focus().setHorizontalRule().run()" :class="toolbarBtn(false)" title="Horizontal Rule">
        <MinusIcon class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

      <!-- Undo/Redo -->
      <button type="button" @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()" :class="toolbarBtn(false, !editor?.can().undo())" title="Undo">
        <Undo2Icon class="w-3.5 h-3.5" />
      </button>
      <button type="button" @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()" :class="toolbarBtn(false, !editor?.can().redo())" title="Redo">
        <Redo2Icon class="w-3.5 h-3.5" />
      </button>

      <!-- Char count -->
      <div class="ml-auto font-mono text-[10px] text-gray-400 pr-1">
        {{ editor?.storage.characterCount?.characters?.() ?? 0 }} karakter
      </div>
    </div>

    <!-- Editor area -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm dark:prose-invert max-w-none min-h-[420px] px-5 py-4 focus-within:outline-none tiptap-content"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon,
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  ListIcon, ListOrderedIcon, QuoteIcon, SquareCodeIcon,
  LinkIcon, UnlinkIcon, ImageIcon, MinusIcon,
  Undo2Icon, Redo2Icon,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    Image.configure({ inline: false, allowBase64: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: props.placeholder || 'Tulis konten artikel di sini...' }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'outline-none',
    },
  },
})

// Sync when parent changes value (for edit mode initial load)
watch(() => props.modelValue, (newVal) => {
  if (editor.value && newVal !== editor.value.getHTML()) {
    editor.value.commands.setContent(newVal, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())

function toolbarBtn(active?: boolean, disabled?: boolean) {
  return [
    'w-7 h-7 flex items-center justify-center transition-colors',
    active
      ? 'bg-indigo-600 text-white'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white',
    disabled ? 'opacity-30 pointer-events-none' : '',
  ]
}

function setLink() {
  if (!editor.value) return
  const prev = editor.value.getAttributes('link').href as string | undefined
  const url = window.prompt('URL Link:', prev ?? 'https://')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function insertImage() {
  if (!editor.value) return
  const url = window.prompt('URL Gambar:', 'https://')
  if (!url) return
  editor.value.chain().focus().setImage({ src: url }).run()
}
</script>

<style>
/* TipTap editor content styles */
.tiptap-content .tiptap {
  outline: none;
}
.tiptap-content .tiptap p.is-editor-empty:first-child::before {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap-content .tiptap h1 { font-size: 1.75rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; line-height: 1.25; }
.tiptap-content .tiptap h2 { font-size: 1.375rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; }
.tiptap-content .tiptap h3 { font-size: 1.125rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
.tiptap-content .tiptap p { margin-bottom: 0.75rem; line-height: 1.75; }
.tiptap-content .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap-content .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap-content .tiptap li { margin-bottom: 0.25rem; }
.tiptap-content .tiptap blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; color: #6b7280; font-style: italic; margin-bottom: 0.75rem; }
.tiptap-content .tiptap code { background: #f3f4f6; color: #4338ca; padding: 0.125rem 0.375rem; font-size: 0.85em; font-family: monospace; }
.tiptap-content .tiptap pre { background: #1e1e2e; color: #cdd6f4; padding: 1rem; margin-bottom: 0.75rem; overflow-x: auto; }
.tiptap-content .tiptap pre code { background: transparent; color: inherit; padding: 0; font-size: 0.875rem; }
.tiptap-content .tiptap hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
.tiptap-content .tiptap img { max-width: 100%; height: auto; margin: 1rem 0; }
.tiptap-content .tiptap a { color: #6366f1; text-decoration: underline; }
.dark .tiptap-content .tiptap h1,
.dark .tiptap-content .tiptap h2,
.dark .tiptap-content .tiptap h3,
.dark .tiptap-content .tiptap p,
.dark .tiptap-content .tiptap li { color: #e5e7eb; }
.dark .tiptap-content .tiptap code { background: rgba(255,255,255,0.08); color: #a5b4fc; }
.dark .tiptap-content .tiptap blockquote { border-color: #6366f1; color: #9ca3af; }
.dark .tiptap-content .tiptap hr { border-color: rgba(255,255,255,0.08); }
</style>
