import { ref, computed, watch } from 'vue'

export const useDarkMode = () => {
  // State untuk dark mode
  const isDarkMode = ref(false)

  // Check preferensi yang tersimpan atau system preference
  const initializeDarkMode = () => {
    if (process.client) {
      const stored = localStorage.getItem('darkMode')
      if (stored !== null) {
        isDarkMode.value = JSON.parse(stored)
      } else {
        // Default: light mode
        isDarkMode.value = false
      }
      
      // Apply ke document class
      updateDocumentClass()
    }
  }

  // Sync state dengan class yang sudah ada di document (untuk SSR)
  const syncWithDocument = () => {
    if (process.client) {
      isDarkMode.value = document.documentElement.classList.contains('dark')
    }
  }

  // Update class di document
  const updateDocumentClass = () => {
    if (process.client) {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  // Watch perubahan dan simpan ke localStorage
  watch(isDarkMode, (newValue) => {
    if (process.client) {
      localStorage.setItem('darkMode', JSON.stringify(newValue))
      updateDocumentClass()
    }
  })

  // Computed untuk icon dan text
  const darkModeIcon = computed(() => isDarkMode.value ? 'Sun' : 'Moon')
  const darkModeText = computed(() => isDarkMode.value ? 'Mode Terang' : 'Mode Gelap')

  return {
    isDarkMode,
    toggleDarkMode,
    darkModeIcon,
    darkModeText,
    initializeDarkMode,
    syncWithDocument
  }
}