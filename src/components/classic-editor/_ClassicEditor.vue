<template>
  <div v-if="editor" class="vuetify-pro-tiptap" :class="{ dense }">
    <!-- Edit Mode -->
    <bubble-menu v-if="!hideBubble" :editor="editor" :disabled="disableToolbar" />

    <v-input class="pt-0" hide-details="auto" :error-messages="errorMessages">
      <v-card
        :flat="flat"
        :outlined="outlined"
        color="grey-lighten-4"
        v-bind="$attrs"
        :style="{
          borderColor: $attrs['error-messages'] ? '#ff5252' : undefined,
          width: '100%'
        }"
        class="vuetify-pro-tiptap-editor"
        :class="{ 'vuetify-pro-tiptap-editor--fullscreen': isFullscreen }"
      >
        <template v-if="label && !isFullscreen">
          <v-card-title :class="isDark ? 'bg-grey-darken-3' : 'bg-grey-lighten-3'">
            {{ label }}
          </v-card-title>
          <v-divider />
        </template>

        <!-- Toolbar -->
        <tip-tap-toolbar
          v-if="!hideToolbar"
          class="vuetify-pro-tiptap-editor__toolbar"
          :editor="editor"
          :disabled="disableToolbar"
        />

        <slot
          name="editor"
          v-bind="{ editor, props: { class: 'vuetify-pro-tiptap-editor__content', 'data-testid': 'value' } }"
        >
          <editor-content
            class="vuetify-pro-tiptap-editor__content"
            :class="contentDynamicClasses"
            :style="contentDynamicStyles"
            :editor="editor"
            data-testid="value"
          />
        </slot>
      </v-card>
    </v-input>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import { useTheme } from 'vuetify'
import { useMarkdownTheme, useProvideTiptapStore } from './hooks'
import { throttle, differenceBy, getCssUnitWithDefault, hasExtension, isBoolean, isEqual } from '@/utils'
import { computed } from 'vue'
import BubbleMenu from './BubbleMenu.vue'
import TipTapToolbar from './TiptapToolbar.vue'
import { defaultBubbleList } from 'vuetify-pro-tiptap';
/**
 * All extensions
 */
import BaseKit from './extensions/base-kit';
import { 
  History,
  Bold,
  Italic,
  Underline,
  Strike,
  Heading
} from './extensions';

export default {
  name: 'VuetifyProTiptap',
  components: {
    EditorContent,
    BubbleMenu,
    TipTapToolbar,
  },
  props: {
    modelValue: {
      type: [String, Object],
      default: '',
    },
    markdownTheme: {
      type: [String, Boolean],
      default: undefined,
    },
    output: {
      type: String,
      default: 'html',
    },
    dark: {
      type: Boolean,
      default: undefined,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: true,
    },
    flat: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: String,
    hideToolbar: {
      type: Boolean,
      default: false,
    },
    disableToolbar: {
      type: Boolean,
      default: false,
    },
    hideBubble: {
      type: Boolean,
      default: false,
    },
    removeDefaultWrapper: {
      type: Boolean,
      default: false,
    },
    maxWidth: [String, Number],
    minHeight: [String, Number],
    maxHeight: [String, Number],
    editorClass: [String, Array, Object],
    errorMessages: {
      type: [String, Array],
      default: () => [],
    },
  },
  data() {
    return {
      editor: null,
      extensions: [
        BaseKit.configure({
          placeholder: {
            placeholder: this.$t("editor.placeholder")
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
        History.configure({ t: { undo: this.$t('editor.undo.tooltip'), redo: this.$t('editor.redo.tooltip') } }),
        Bold.configure({ t: this.$t('editor.bold.tooltip') }),
        Italic.configure({ t: this.$t('editor.italic.tooltip') }),
        Underline.configure({ t: this.$t('editor.underline.tooltip') }),
        Strike.configure({ t: this.$t('editor.strike.tooltip') }),
        Heading.configure({
            t: {
              h: this.$t('editor.heading.tooltip'),
              h1: this.$t('editor.heading.h1.tooltip'),
              h2: this.$t('editor.heading.h2.tooltip'),
              h3: this.$t('editor.heading.h3.tooltip'),
              h4: this.$t('editor.heading.h4.tooltip'),
              h5: this.$t('editor.heading.h5.tooltip'),
              h6: this.$t('editor.heading.h6.tooltip')
            }
          }
        ),
      ],
      theme: useTheme(),
      state: useProvideTiptapStore().state,
      isFullscreen: useProvideTiptapStore().isFullscreen,
      markdownThemeStyle: useMarkdownTheme(
        computed(() => this.markdownTheme),
        (value) => this.$emit('update:markdownTheme', value)
      ),
    }
  },
  computed: {
    sortExtensions() {
      const diff = differenceBy(this.extensions, this.state.extensions, 'name')
      const exts = this.state.extensions.map((k) => {
        const find = this.extensions.find((ext) => ext.name === k.name)
        if (!find) return k
        return k.configure(find.options)
      })
      return [...exts, ...diff].map((k, i) => k.configure({ sort: i }))
    },
    contentDynamicClasses() {
      const values = {
        ...this.markdownThemeStyle,
      }
      return [values, this.editorClass]
    },
    contentDynamicStyles() {
      const maxWidth = getCssUnitWithDefault(this.maxWidth)
      const maxHeightStyle = {
        maxWidth: maxWidth,
        width: !maxWidth ? undefined : '100%',
        margin: !maxWidth ? undefined : '0 auto',
        backgroundColor: '#FFFFFF',
      }
      if (this.isFullscreen) return { height: '100%', overflowY: 'auto', ...maxHeightStyle }
      const minHeight = getCssUnitWithDefault(this.minHeight)
      const maxHeight = getCssUnitWithDefault(this.maxHeight)
      return {
        minHeight,
        maxHeight,
        overflowY: 'auto',
        ...maxHeightStyle,
      }
    },
  },
  watch: {
    modelValue(newValue) {
      this.onValueChange(newValue)
    },
    disabled(newValue) {
      this.onDisabledChange(newValue)
    },
  },
  methods: {
    hasExtension,
    throttle,
    getOutput(editor, output) {
      if (this.removeDefaultWrapper) {
        if (output === 'html') return editor.isEmpty ? '' : editor.getHTML()
        if (output === 'json') return editor.isEmpty ? {} : editor.getJSON()
        if (output === 'text') return editor.isEmpty ? '' : editor.getText()
        return ''
      }

      if (output === 'html') return editor.getHTML()
      if (output === 'json') return editor.getJSON()
      if (output === 'text') return editor.getText()
      return ''
    },
    onValueChange(val) {
      if (!this.editor) return
      const output = this.getOutput(this.editor, this.output)

      if (isEqual(output, val)) return

      const { from, to } = this.editor.state.selection
      this.editor.commands.setContent(val, false)
      this.editor.commands.setTextSelection({ from, to })
    },
    onDisabledChange(val) {
      if (this.editor) this.editor.setEditable(!val)
    },
  },
  created() {
    // this.editor = new Editor({
    //   extensions: [
    //     Document,
    //     Paragraph,
    //     Text
    //   ]
    // });
    //
    // set default content
    //
    // this.editor.commands.setContent(
    //   this.mode == "json"
    //     ? {
    //         type: "doc",
    //         content: this.modelValue,
    //       }
    //     : this.modelValue
    // );

    this.editor = new Editor({
      content: this.modelValue,
      editorProps: {
        handleKeyDown: throttle((view, event) => {
          if (event.key === 'Enter' && this.$attrs.enter && !event.shiftKey) {
            this.$emit('enter')
            return true
          }
          return false
        }, 200),
      },
      onUpdate: throttle(({ editor }) => {
        const output = this.getOutput(editor, this.output)
        this.$emit('update:modelValue', output)
        this.$emit('change', { editor, output })
      }, 200),
      extensions: this.sortExtensions,
      autofocus: false,
      editable: !this.disabled,
      injectCSS: true,
    });

  },

  destroyed() {
    this.editor?.destroy()
  },
}
</script>

