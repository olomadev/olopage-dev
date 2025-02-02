<template>
  <va-form :id="id" :item="item" v-model="model">
    <v-row no-gutters class="mb-2">    
      <v-col cols="12" md="8" lg="9" sm="12">
        <v-card :loading="loading" flat border height="100%" min-height="600" class="d-flex flex-column">
            <v-row no-gutters class="classiceditor-form">
              <v-col>
                <!-- 
                  Custom Upload
                  https://github.com/yikoyu/vuetify-pro-tiptap/issues/333
                -->
                <ClassicEditor 
                  ref="editorRef"
                  :key="editorKey"
                  v-model="model.contentJson"
                  v-model:markdown-theme="markdownTheme"
                  output="json"
                  :outlined="true"
                  :error-messages="errorMessages"
                  rounded
                  :min-height="600"
                  :max-width="maxWidth"
                  @change="onChange"
                >
                </ClassicEditor>
              </v-col>
            </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" lg="3" sm="12">
        <div id="sticky-top-div" style="position: sticky; top: 0; z-index: 10;">
          <v-card flat :class="smAndDown ? 'ml-lg-5 ml-md-5 mt-2' : 'ml-lg-5 ml-md-5'" border>
            <v-card-text>
              <v-row no-gutters class="mb-2">
                <v-col cols="12">
                  <v-btn v-if="previewable" :loading="loadingPublish" block flat :prepend-icon="publishStatusIcon" :color="publishStatusColor" @click.stop="togglePublish">
                    {{ publishStatusText }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-row no-gutters class="mb-2" v-if="previewable">
                <v-col cols="12">
                  <v-btn block flat prepend-icon="mdi-eye-outline">{{ $t('resources.posts.preview') }}</v-btn>
                </v-col>
              </v-row>

              <v-row no-gutters class="mb-5">
                <v-col cols="12">
                  <v-btn ref="saveButton" block flat prepend-icon="mdi-content-save" color="secondary" @click.stop="save">
                    {{ $t('va.actions.save') }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <va-text-input
                    source="route"
                    prefix="/"
                    :error-messages="routeErrors"
                  ></va-text-input>               
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <va-text-input
                    source="title"
                    :error-messages="titleErrors"
                  ></va-text-input>               
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <va-text-input
                    source="keywords"
                  ></va-text-input>               
                </v-col>
              </v-row>

              <v-row no-gutters>
                <v-col cols="12">
                  <va-text-input
                    source="description"
                    multiline
                  ></va-text-input>               
                </v-col>
              </v-row>

              <v-row no-gutters style="height: 30px">
                <v-col>
                  <v-alert v-if="message.show" density="compact"  class="alerts" :text="message.text" :type="message.type" :icon="false" variant="tonal" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </va-form>
</template>
<script>
import { provide } from 'vue';
import { useDisplay } from 'vuetify';
import { useVuelidate } from "@vuelidate/core";
import { required, email, minLength, maxLength } from "@vuelidate/validators";
import Utils from "olobase-admin/src/mixins/utils";
import useStore from "@/store";
import Pages from "@/mixins/pages";
// import ClassicEditor from '@/components/classic-editor/ClassicEditor.vue';

export default {
  props: ["id", "item"],
  mixins: [Utils, Pages],
  // components: {
  //   ClassicEditor
  // },
  setup() {
    let vuelidate = useVuelidate();
    const { smAndDown } = useDisplay();
    provide('v$', vuelidate)
    return { v$: vuelidate , smAndDown}
  },
  validations() {
    return {
      model: {
        route: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(60),
        },
        title: {
          required,
          minLength: minLength(2),
          maxLength: maxLength(100),
        },
      },
    }
  },
  watch: {
    "$store.getApplyImageEvent"(val) {
      if (val) {
        this.saveContent();
        this.$store.applyImageEvent(false); // reset event variable
      }
    }
  },
  data() {
    return {
      editor: null,
      editorKey: 0,
      draftId: null,
      fileNames: [], // store all files
      loading: false,
      previewable: false,
      loadingPublish: false,
      VuetifyTiptapRef: null,
      output: null,
      markdownTheme: null,
      errorMessages: null,
      maxWidth: 900,
      model: {
        id: null,
        route: null,
        title: null,
        keywords: null,
        description: null,        
        contentHtml: null,
        contentJson: null,
        publishStatus: "draft",
      },
    };
  },
  async created() {
    this.model.id = this.generateId(this);
    const store = useStore()
    store.setResourceId(this.model.id); // set id for tiptap image process
    this.previewable = this.$router.currentRoute.value.path === "/pages/create" ? false : true;
    if (this.item) {
      this.fileNames = this.item.pageFiles; // set page files
    }
  },
  mounted() {
    if (this.item) {
      this.model.contentJson = this.item.contentJson;
      this.model.contentHtml = this.item.contentHtml;
      this.model.publishStatus = this.item.publishStatus;
      ++this.editorKey;
    }
  },
  methods: {
    onChange({ editor, output }) {
      this.editor = editor;
      //
      // detect images
      //
      const json = editor.getJSON();
      if (json['content'] && Array.isArray(json.content)) {
        json.content.forEach(row => {
          if (row?.content && row.content[0]) {
            const item = row.content[0];
            if (item?.attrs?.src) {
              const src = item.attrs.src;
              const urlParams = new URLSearchParams(src.split('?')[1]);
              const fileName = urlParams.get('fileName');
              if (fileName) {
                if (!this.fileNames.includes(fileName)) {
                  this.fileNames.push(fileName);  
                }
              }
            }
          }
        });
      }
      //
      // execute delete operation for found files
      //
      let foundImages = []
      json.content.forEach(row => {
        if (row?.content && row.content[0]) {
          row.content.forEach(item => {
            if (item?.attrs?.src) {
              const src = item.attrs.src;
              const urlParams = new URLSearchParams(src.split('?')[1]);
              const fileName = urlParams.get('fileName');
              if (fileName) {
                foundImages.push(fileName);
              }
            }
          })
        }
      });
      // console.error("Found Images:");
      // console.error(foundImages);
      // console.error("Filenames:");
      // console.error(this.fileNames);

      this.fileNames.forEach(name => {
        if (! foundImages.includes(name)) {
          this.$admin.http({ method: "DELETE", url: "/files/delete", params: { pageId: this.model.id, fileName: name }}).then(res => {
            if (res && res.status == 200) { // reset
              const index = this.fileNames.indexOf(name); // delete image from fileNames
              if (index > -1) {
                this.fileNames.splice(index, 1);
              }
              this.saveContent();
            }  
          });
        }
      });
      foundImages = []; // reset delete image storage
    },
    async save() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return false;
      }    
      // this.model.contentHtml = this.editor.getHTML()
      this.model.contentHtml = this.$refs.editorRef.editor.getHTML()
      const Self = this;
      this.loading = "primary";
      let response = null;
      if (! this.previewable && this.draftId != this.model.id) { // check record exists
        try {
          await this.$admin.http({ method: "GET", url: `/pages/findOneById/${this.model.id}` }).then(function(res) {
            if (res) {
              // console.error(res.data.data);
            }
          });
          await this.update();
        } catch (error) {
          if (error.status == 404) {
            await this.create();
            this.draftId = this.model.id; // save as draft
          }
          this.loading = false;
        }
      } else {
        await this.update();
      }
      this.loading = false;
    },
    async create() {
      try {
        const res = await this.$admin.http({ method: "POST", url: "/pages/create", data: this.model });
        if (res && res.status === 200) {
          this.previewable = true;
          this.showMessage("success", this.$t("resources.pages.messages.pageCreatedSuccessfully"))
        }
      } catch (error) {
        console.error("Create error:", error);
      }
    },
    async update() {
      try {
        const res = await this.$admin.http({ method: "PUT", url: `/pages/update/${this.model.id}`, data: this.model });
        if (res && res.status === 200) {
          this.previewable = true;
          this.showMessage("success", this.$t("resources.pages.messages.pageUpdatedSuccessfully"))
        }
      } catch (error) {
        console.error("Update error:", error);
      }
    },
    saveContent() {
      const saveButton = this.$refs?.saveButton?.$el;
      if (saveButton) {
        saveButton.click();
      }
    }
  },
  computed: {
    routeErrors() {
      const errors = [];
      if (!this.v$['model'].route.$dirty) return errors;
      this.v$['model'].route.required.$invalid &&
        errors.push(this.$t("v.text.required"));
      this.v$['model'].route.minLength.$invalid &&
        errors.push(this.$t("v.string.minLength", { min: "1" }));
      this.v$['model'].route.maxLength.$invalid &&
        errors.push(this.$t("v.string.maxLength", { max: "60" }));
      return errors;
    },
    titleErrors() {
      const errors = [];
      if (!this.v$['model'].title.$dirty) return errors;
      this.v$['model'].title.required.$invalid &&
        errors.push(this.$t("v.text.required"));
      this.v$['model'].title.minLength.$invalid &&
        errors.push(this.$t("v.string.minLength", { min: "2" }));
      this.v$['model'].title.maxLength.$invalid &&
        errors.push(this.$t("v.string.maxLength", { max: "100" }));
      return errors;
    }
  },
}
</script>