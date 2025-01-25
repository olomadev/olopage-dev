/**
 * @oloma.dev (c) 2023-2025
 *
 * - plugins/tiptap.js
 * 
 * Plugin: https://github.com/yikoyu/vuetify-pro-tiptap
 */
import 'vuetify-pro-tiptap/styles/editor.css'
import 'vuetify-pro-tiptap/styles/markdown.css'
import '@/styles/github.scss'

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});
import i18n from "../i18n";
import useStore from "../store";
import config from "@/_config";
import { getApiUrl, generateUid } from "@/utils"
import slugify from 'slugify';
import { markRaw } from 'vue';
import { VuetifyTiptap, VuetifyViewer, createVuetifyProTipTap, defaultBubbleList } from 'vuetify-pro-tiptap';

import Image from "@/extensions/image";
import {  
  BaseKit,
  Bold,
  Italic,
  Underline,
  Strike,
  Color,
  Highlight,
  Heading,
  TextAlign,
  FontFamily,
  FontSize,
  SubAndSuperScript,
  BulletList,
  OrderedList,
  TaskList,
  Indent,
  Link,
  Video,
  Table,
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,
  Clear,
  // Fullscreen,
  History
} from 'vuetify-pro-tiptap';
import 'vuetify-pro-tiptap/style.css';

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
        placeholder: 'Enter you content here...'
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
    Bold,
    Italic,
    Underline,
    Strike,
    // Code.configure({ divider: true }),
    Heading,
    TextAlign,
    FontFamily,
    FontSize,
    Color,
    Highlight.configure({ divider: true }),
    SubAndSuperScript.configure({ divider: true }),
    Clear.configure({ divider: true }),
    BulletList,
    OrderedList,
    TaskList,
    Indent.configure({ divider: true }),
    Link,
    Image.configure({
      // Generate a VDivider after the button
      divider: true,
      imageTabs: [],  // { name: 'SELECT', component: markRaw(SelectImage) }
      // hiddenTabs: ['upload'],
      async upload(file) {
        const fileName = slugify(file.name, {
          replacement: config.slugify.replacement,  // replace spaces with replacement character, defaults to `-`
          remove: config.slugify.remove, // remove characters that match regex, defaults to `undefined`
          lower: config.slugify.lower,   // convert to lower case, defaults to `false`
          strict: config.slugify.strict,  // strip special characters except replacement, defaults to `false`
          locale: "en", // language code of the locale to use
          trim: config.slugify.trim, // trim leading and trailing replacement chars, defaults to `true`
        });
        // const url = URL.createObjectURL(file);  // mock api
        const store = useStore()
        const admin = store.getAdmin;
        const base64 = await toBase64(file);
        const res = await admin.http(
          { 
            method: "POST", 
            url: "/files/create", 
            data: { 
              pageId: store.getResourceId,
              fileId: generateUid(), 
              fileName: fileName,  
              fileType: file.type, 
              fileSize: (file.size / 1024).toFixed(2), 
              fileData: base64,
              thumb: false,
            },
          }
        );
        let url = null;
        if (res && res.status === 200 && res?.data?.data['original']) {
          url = getApiUrl("/files/display?fileName=" + res?.data?.data.original.fileName);
        }
        return url;
      }
    }),
    Video,
    Table.configure({ divider: true }),
    Blockquote,
    HorizontalRule,
    CodeBlock.configure({ divider: true }),
    History.configure({ divider: true }),
    // Fullscreen.configure({
    //   // Generate a VSpacer after the button
    //   spacer: true
    // })
  ],
});

// console.error(vuetifyProTipTap)