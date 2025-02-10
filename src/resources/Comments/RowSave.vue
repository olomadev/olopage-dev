<template>
  <v-form @submit.prevent="save">
    <v-row justify="center">
      <v-card-text>
        <v-row no-gutters>
          <v-col class="mr-3">
            <va-text-input
              source="name"
              v-model="model.name"
              variant="outlined"
              :error-messages="nameErrors"
            ></va-text-input>

            <v-card :loading="loading" flat border height="100%" max-height="400" class="d-flex flex-column">
              <v-row no-gutters>
                <v-col>
                  <SimpleEditor 
                    v-if="extensions.length > 0"
                    :extensions="extensions"
                    v-model="model.body"
                    output="html"
                    :outlined="true"
                    rounded
                    :min-height="400"
                  >
                  </SimpleEditor>
                </v-col>
              </v-row>
            </v-card>

            <va-boolean-input 
              class="ml-3"
              source="published"
              v-model="model.published"
            >  
            </va-boolean-input>
          </v-col>
        </v-row>

        <v-btn
          color="primary"
          :loading="loading"
          type="submit"
        >
          {{ $t("va.actions.save") }}
        </v-btn>
      </v-card-text>  
    </v-row>
  </v-form>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import utils from "olobase-admin/src/mixins/utils";
import { required, minLength, maxLength } from "@vuelidate/validators";
import { provide } from 'vue';
import { marked } from 'marked';
import SimpleEditor from "@/components/classic-editor/ClassicEditor";
import { defaultBubbleList } from "@/components/classic-editor/bubble";
import {
  BaseKit,
  History,
  Bold,
  Italic,
  Underline,
  BulletList,
  OrderedList,
  CodeBlock,
  Link,
  Blockquote
} from '@/components/classic-editor/extensions';

export default {
  props: ["item"],
  mixins: [utils],
  inject: ['admin'],
  components: {
    SimpleEditor
  },
  setup() {
    let vuelidate = useVuelidate();
    provide('v$', vuelidate)
    return { v$: vuelidate }
  },
  validations(){
    return {
      model: {
        name: {
          required
        },
        body: {
          required
        },
      }
    }
  },
  data() {
    return {
      loading: false,
      extensions: [],
      markdownTheme: "github",
      model: {
        id: null,
        name: null,
        body: null,
        published: 0,
      }
    };
  },
  watch: {
    markdownTheme(val) {
      if (!val) {
        this.markdownTheme = "github"; // Eğer boşsa, github temasına set et
      }
    }
  },
  created() {
    if (!this.markdownTheme) {
      this.markdownTheme = "github";
    }
    this.extensions = [
      BaseKit.configure({
        placeholder: {
          placeholder: this.$t("editor.placeholder")
        },
        bubble: {
          // default config
          list: {
            text: ['bold', 'italic', 'underline', 'divider', 'link'],
          },
          defaultBubbleList: editor => {
            // You can customize the bubble menu here
            const defaultBubble = defaultBubbleList(editor)
            return defaultBubble; // default customize bubble list
          }
        }
      }),
      History.configure({ t: this.$t, divider: true  }),
      Bold.configure({ t: this.$t }),
      Italic.configure({ t: this.$t }),
      Underline.configure({ t: this.$t }),
      BulletList.configure({
        t: this.$t,
        HTMLAttributes: {
          class: 'list-disc pl-5',
        },
      }),
      OrderedList.configure({
        t: this.$t,
        HTMLAttributes: {
          class: 'list-decimal pl-5',
        },
      }),      
      Link.configure({ t: this.$t, divider: false }),
      Blockquote.configure({ t: this.$t }),
      CodeBlock.configure({ t: this.$t }),
    ];
    if (this.item && Object.prototype.hasOwnProperty.call(this.item, 'id')) {
      this.model = Object.assign(this.model, this.item);
      if (this.model.body) { // convert markdown to HTML
        this.model.body = marked(this.model.body);
      }
    } else {
      this.model.id = this.generateUid();
    }
  },
  computed: {
    nameErrors() {
      const errors = [];
      const field = "name";
      if (!this.v$['model'][field].$dirty) return errors;
      this.v$['model'][field].required.$invalid && errors.push(this.$t("v.text.required"));
      return errors;
    },
    bodyErrors() {
      const errors = [];
      const field = "body";
      if (!this.v$['model'][field].$dirty) return errors;
      this.v$['model'][field].required.$invalid && errors.push(this.$t("v.text.required"));
      return errors;
    },
  },
  methods: {
    async save() {
      let invalid = this.validateForm(this, "model");  // validate multiple forms separately
      if (invalid) {
        return false;
      }
      this.loading = true;
      await this.admin.http({ method: "PUT", url: "/comments/update/" + this.model.id, data: this.model });
      this.admin.refresh('comments');
      this.loading = false;
    }
  },
}
</script>
