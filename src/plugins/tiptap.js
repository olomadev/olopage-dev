/**
 * @oloma.dev (c) 2023-2025
 *
 * - plugins/tiptap.js
 * 
 * Plugin: https://github.com/yikoyu/vuetify-pro-tiptap
 */
import '@/components/classic-editor/styles/index.scss'

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});
import i18n from "../i18n";
const $t = i18n.global.t;
import useStore from "../store";
import config from "@/_config";
import { getApiUrl, generateUid } from "@/utils"
import slugify from 'slugify';
import { createVuetifyProTipTap } from "@/components/classic-editor/hooks";
import { defaultBubbleList } from 'vuetify-pro-tiptap';
import VuetifyTiptap from "@/components/classic-editor/VuetifyTiptap";
import VuetifyViewer from "@/components/classic-editor/VuetifyViewer";
import { 
  BaseKit,
  History,
  Bold,
  Italic,
  Underline,
  Strike,
  Heading,
  // Link,
  // Image,
  // Video,
} from '../components/classic-editor/extensions';

export const vuetifyProTipTap = createVuetifyProTipTap({
  lang: i18n.global.locale.value,
  markdownTheme: 'github',
  components: {
    VuetifyTiptap,
    VuetifyViewer
  },
  extensions: [
    BaseKit.configure({
      placeholder: {
        placeholder: $t("editor.placeholder")
      },
      bubble: {
        // default config
        list: {
          image: [ 'float-left', 'float-none', 'float-right', 'divider', 'size-small', 'size-medium', 'size-large', 'divider', 'textAlign', 'divider', 'image', 'image-aspect-ratio', 'remove'],
          text: ['bold', 'italic', 'underline', 'strike', 'divider', 'color', 'highlight', 'textAlign', 'divider', 'link'],
          video: ['video', 'remove']
        },
        defaultBubbleList: editor => {
          // You can customize the bubble menu here
          return defaultBubbleList(editor); // default customize bubble list
        }
      }
    }),
    History.configure({ t: { undo: $t('editor.undo.tooltip'), redo: $t('editor.redo.tooltip') } }),
    Bold.configure({ t: $t('editor.bold.tooltip') }),
    Italic.configure({ t: $t('editor.italic.tooltip') }),
    Underline.configure({ t: $t('editor.underline.tooltip') }),
    Strike.configure({ t: $t('editor.strike.tooltip') }),
    Heading.configure({
        t: {
          h: $t('editor.heading.tooltip'),
          h1: $t('editor.heading.h1.tooltip'),
          h2: $t('editor.heading.h2.tooltip'),
          h3: $t('editor.heading.h3.tooltip'),
          h4: $t('editor.heading.h4.tooltip'),
          h5: $t('editor.heading.h5.tooltip'),
          h6: $t('editor.heading.h6.tooltip')
        }
      }
    ),
  ],
});

// console.error(vuetifyProTipTap)