import { DEFAULT_LANG_VALUE, DEFAULT_MARKDOWN_THEME_VALUE } from '../constants/define'
import { createInjectionState } from '@vueuse/core'

import { computed, reactive, watchEffect } from 'vue'
import { useContext } from './use-context'

export const [useProvideTiptapStore, useTiptapStore] = createInjectionState(() => {
  const { state: _state } = useContext()

  const state = reactive({
    extensions: _state.extensions ?? [],
    defaultLang: DEFAULT_LANG_VALUE,
    defaultMarkdownTheme: DEFAULT_MARKDOWN_THEME_VALUE,
    isFullscreen: false,
    color: undefined,
    highlight: undefined
  })

  const isFullscreen = computed(() => state.isFullscreen)

  function toggleFullscreen() {
    state.isFullscreen = !state.isFullscreen
  }

  watchEffect(() => {
    state.extensions = _state.extensions
    state.defaultLang = _state.defaultLang
    state.defaultMarkdownTheme = _state.defaultMarkdownTheme
  })

  return {
    state,
    isFullscreen,
    toggleFullscreen
  }
})
