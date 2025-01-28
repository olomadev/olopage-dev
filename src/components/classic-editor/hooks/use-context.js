import { reactive } from 'vue';

const state = reactive({
  extensions: [],
  defaultLang: undefined,
  defaultMarkdownTheme: undefined,
});

export function createContext(instance) {
  state.defaultLang = instance.defaultLang;
  state.defaultMarkdownTheme = instance.defaultMarkdownTheme;
  state.extensions = instance.extensions || [];
}

export function useContext() {
  return {
    state,
  };
}