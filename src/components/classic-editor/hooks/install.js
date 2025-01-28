import { createContext } from './index.js'

export const createVuetifyProTipTap = (opts) => {
  const install = (app) => {
    const { lang, markdownTheme, components = {}, extensions } = opts || {};

    Object.keys(components).forEach((key) => {
      app.component(key, components[key]);
    });

    createContext({
      defaultLang: "en",
      defaultMarkdownTheme: markdownTheme,
      extensions,
    });
  };

  return install;
};
export default createVuetifyProTipTap;