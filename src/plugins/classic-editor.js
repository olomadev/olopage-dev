/**
 * @oloma.dev (c) 2023-2025
 *
 * - plugins/classic-editor.js
 * 
 * Plugin: https://github.com/yikoyu/vuetify-pro-tiptap
 */
import '@/components/classic-editor/styles/index.scss'
import i18n from "../i18n";
const $t = i18n.global.t;
import useStore from "../store";
import config from "@/_config";
import { getApiUrl, generateUid, toBase64 } from "@/utils"
import slugify from 'slugify';
import { defaultBubbleList } from "@/components/classic-editor/bubble";
import { createVuetifyProTipTap } from "@/components/classic-editor/hooks";
import ClassicEditor from "@/components/classic-editor/ClassicEditor";
import VuetifyViewer from "@/components/classic-editor/VuetifyViewer";

import {
  BaseKit,
  History,
  Bold,
  Italic,
  Underline,
  Strike,
  Heading,
  TextAlign,
  FontFamily,
  FontSize,
  Color,
  Highlight,
  Clear,
  BulletList,
  OrderedList,
  Indent,
  Link,
  Image,
  Video,
  // Highlight.configure({ divider: true }),
  // SubAndSuperScript.configure({ divider: true }),
  // TaskList,
  // Indent.configure({ divider: true }),
  // Link.configure({
  //   dialogComponent: () => LinkDialog
  // }),
  // Image.configure({
  //   imageTabs: [{ name: 'SELECT', component: markRaw(SelectImage) }],
  //   width: 500,
  //   // hiddenTabs: ['upload'],
  //   upload(file: File) {
  //     const url = URL.createObjectURL(file)
  //     console.log('mock upload api :>> ', url)
  //     return Promise.resolve(url)
  //   }
  // }),
// Video,
} from '../components/classic-editor/extensions';

export const classicEditor = createVuetifyProTipTap({
  lang: i18n.global.locale.value,
  markdownTheme: 'github',
  components: {
    ClassicEditor,
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
          image: [ 'float-left', 'float-none', 'float-right', 'divider', 'image-size-small', 'image-size-medium', 'image-size-large', 'divider', 'textAlign', 'divider', 'image', 'image-aspect-ratio', 'remove'],
          text: ['bold', 'italic', 'underline', 'strike', 'divider', 'color', 'highlight', 'textAlign', 'divider', 'link'],
          video: ['video', 'video-size-small', 'video-size-medium', 'video-size-large', 'remove']
        },
        defaultBubbleList: editor => {
          // You can customize the bubble menu here
          const defaultBubble = defaultBubbleList(editor)
          return defaultBubble; // default customize bubble list
        }
      }
    }),
    History.configure({ t: $t, divider: true  }),
    FontFamily.configure({ t: $t, divider: true }),
    FontSize.configure({ t: $t, divider: true }),
    Bold.configure({ t: $t }),
    Italic.configure({ t: $t }),
    Underline.configure({ t: $t }),
    Strike.configure({ t: $t }),
    Heading.configure({ t: $t }),
    TextAlign.configure({ t: $t, types: ['heading', 'paragraph', 'image', 'blockquote', 'div'] }),
    Clear.configure({ t: $t, divider: true }),
    Color.configure({ t: $t }),
    Highlight.configure({ t: $t, divider: true }),
    BulletList.configure({ t: $t }),
    OrderedList.configure({ t: $t }),
    Indent.configure({ t: $t, divider: true }),
    Link.configure({ t: $t, divider: false }),
    Image.configure({
      t: $t,
      width: 500,
      // imageTabs: [],  // { name: 'SELECT', component: markRaw(SelectImage) }
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
        return Promise.resolve(url)
      }
    }),
    Video.configure({ t: $t, divider: false }),
  ],
});