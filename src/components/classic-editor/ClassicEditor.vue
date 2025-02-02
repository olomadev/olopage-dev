<template>
  <div v-if="editor" class="vuetify-pro-tiptap">
    
    <BubbleMenu v-if="!hideBubble" :editor="editor" :disabled="disableToolbar" />

    <v-input class="pt-0" hide-details="auto" :error-messages="errorMessages">
      <v-card
        :flat="flat"
        :outlined="outlined"
        color="grey-lighten-4"
        :style="{
          borderColor: errorMessages ? '#ff5252' : undefined,
          width: '100%',
        }"
        class="vuetify-pro-tiptap-editor"
        :class="{ 'vuetify-pro-tiptap-editor--fullscreen': isFullscreen }"
      >
        <template v-if="label && !isFullscreen">
          <v-card-title :class="bg-grey-lighten-3">
            {{ label }}
          </v-card-title>
          <v-divider />
        </template>

        <TipTapToolbar
          v-if="!hideToolbar"
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
import { computed, watch, onUnmounted } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { EDITOR_UPDATE_THROTTLE_WAIT_TIME, EDITOR_UPDATE_WATCH_THROTTLE_WAIT_TIME } from './constants/define';
import { useMarkdownTheme, useProvideTiptapStore } from './hooks';
import { throttle, getCssUnitWithDefault, isBoolean, isEqual, differenceBy } from '@/utils';
import BubbleMenu from './BubbleMenu.vue';
import TipTapToolbar from './TiptapToolbar.vue';

export default {
  name: 'ClassicEditor',
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
    label: {
      type: String,
      default: undefined,
    },
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
    maxWidth: {
      type: [String, Number],
      default: undefined,
    },
    minHeight: {
      type: [String, Number],
      default: undefined,
    },
    maxHeight: {
      type: [String, Number],
      default: undefined,
    },
    extensions: {
      type: Array,
      default: () => [],
    },
    editorClass: {
      type: [String, Array, Object],
      default: undefined,
    },
    errorMessages: {
      type: [String, Array],
      default: () => [],
    },
  },
  emits: ['enter', 'change', 'update:modelValue', 'update:markdownTheme'],
  setup() {
    const { state, isFullscreen } = useProvideTiptapStore();
    return {
      state,
      isFullscreen
    }
  },
  data() {
    return {
      editor: null,
      updateHandler: null,
      markdownThemeStyle: null,
    }
  },
  watch: {
    markdownTheme: {
      immediate: true, // it is triggered at first.
      handler(newValue) {
        if (this.updateHandler) {
          this.updateHandler(newValue);
        }
      },
    },
  },
  created() {
    try {
      const { markdownThemeStyle, updateHandler } = useMarkdownTheme(
        () => this.markdownTheme,
        (value) => {
          if (value !== this.markdownTheme) {
            this.$emit("update:markdownTheme", value);
          }
        }
      );
      this.markdownThemeStyle = markdownThemeStyle;
      this.updateHandler = updateHandler;
      //
      // create editor
      // 
      this.editor = new Editor({
        content: this.modelValue,
        // editorProps: {
        //   handleKeyDown: throttle((view, event) => {
        //     if (event.key === 'Enter' && !event.shiftKey) {
        //       this.$emit('enter');
        //       return true;
        //     }
        //     return false;
        //   }, EDITOR_UPDATE_THROTTLE_WAIT_TIME),
        // },
        onUpdate: throttle(({ editor }) => {
          const output = this.getOutput(editor, this.output);
          this.$emit('update:modelValue', output);
          this.$emit('change', { editor, output });
        }, EDITOR_UPDATE_THROTTLE_WAIT_TIME),
        extensions: this.sortExtensions(this.state, this.extensions),
        autofocus: false,
        editable: !this.disabled,
        injectCSS: true,
      });
    } catch (error) {
      console.error('Error while creating the editor:', error);
    }
  },
  computed: {
    contentDynamicClasses() {
      return [
        {
          ...this.markdownThemeStyle,
        },
        this.editorClass,
      ];
    },
    contentDynamicStyles() {
      const maxWidth = getCssUnitWithDefault(this.maxWidth);
      const maxHeightStyle = {
        maxWidth: maxWidth,
        width: !maxWidth ? undefined : '100%',
        margin: !maxWidth ? undefined : '0 auto',
        backgroundColor: '#FFFFFF',
      };
      if (this.isFullscreen) return { height: '100%', overflowY: 'auto', ...maxHeightStyle };
      const minHeight = getCssUnitWithDefault(this.minHeight);
      const maxHeight = getCssUnitWithDefault(this.maxHeight);
      return {
        minHeight,
        maxHeight,
        overflowY: 'auto',
        ...maxHeightStyle,
      };
    },
  },
  methods: {
    getOutput(editor, output) {
      if (this.removeDefaultWrapper) {
        if (output === 'html') return editor.isEmpty ? '' : editor.getHTML();
        if (output === 'json') return editor.isEmpty ? {} : editor.getJSON();
        if (output === 'text') return editor.isEmpty ? '' : editor.getText();
        return '';
      }
      if (output === 'html') return editor.getHTML();
      if (output === 'json') return editor.getJSON();
      if (output === 'text') return editor.getText();
      return '';
    },
    sortExtensions(state, extensions) {
      const diff = differenceBy(extensions, state.extensions, 'name');
      const exts = state.extensions.map((k) => {
        const find = extensions.find((ext) => ext.name === k.name);
        if (!find) return k;
        return k.configure(find.options);
      });
      return [...exts, ...diff].map((k, i) => k.configure({ sort: i }));
    },
  },
};
</script>
