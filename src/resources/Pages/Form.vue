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
                <VuetifyTiptap
                  :key="editorKey"
                  ref="VuetifyTiptapRef"
                  v-model="model.contentJson"
                  v-model:markdown-theme="markdownTheme"
                  output="json"
                  :outlined="true"
                  :error-messages="errorMessages"
                  rounded
                  :min-height="600"
                  :max-width="maxWidth"
                  @change="onChange"
                />
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

              <v-row no-gutters class="mb-5" v-if="previewable">
                <v-col cols="12">
                  <v-btn block flat prepend-icon="mdi-eye-outline">{{ $t('resources.posts.preview') }}</v-btn>
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

              <v-row no-gutters class="mb-2">
                <v-col cols="12">
                  <v-btn ref="saveButton" block flat prepend-icon="mdi-content-save" color="secondary" @click.stop="save">
                    {{ $t('va.actions.save') }}
                  </v-btn>
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

export default {
  props: ["id", "item"],
  mixins: [Utils, Pages],
  components: {
    
  },
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
  // watch: {
  //   "model.contentJson"(val) {
  //     console.error(val)
  //   }
  // },
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
      editHtml: false,
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
    // console.error(this.item);

    // fill page images
    // await this.$admin.http({ method: "GET", url: `/pages/findOneById/${this.model.id}` }).then(function(res) {
    // if (res 
    //     && res?.data?.data?.publishedAt 
    //     && res.data.data.publishedAt
    //     && typeof res.data.data.publishedAt === "string") {
    //     const [datePart, timePart] = res.data.data.publishedAt.split(' ');
    //     Self.model.publishedAt = res.data.data.publishedAt;
    //     Self.model.publishedDate = datePart;
    //     Self.model.publishedTime = timePart;  
    // }

  },
  mounted() {
    if (this.item) {
      this.model.contentJson = this.item.contentJson;
      this.model.contentHtml = this.item.contentHtml;
      ++this.editorKey;
    }
  },
  methods: {
    onChange({ editor, output }) {
      this.editor = editor;
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
      // delete operations
      //
      let foundImages = []
      json.content.forEach(row => {
        if (row?.content && row.content[0]) {
          const item = row.content[0];
          if (item?.attrs?.src) {
            const src = item.attrs.src;
            const urlParams = new URLSearchParams(src.split('?')[1]);
            const fileName = urlParams.get('fileName');
            if (fileName) {
              foundImages.push(fileName);
            }
          }
        }
      });
      this.fileNames.forEach(name => {
        if (! foundImages.includes(name)) {
          console.error("Delete images request for: " + name);

          
          foundImages = []; // reset delete image storage
          const index = this.fileNames.indexOf(name); // delete image from fileNames
          if (index > -1) {
            this.fileNames.splice(index, 1);
          }
        }
      });
    },
    async save() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return false;
      }    
      this.model.contentHtml = this.$refs.VuetifyTiptapRef.editor.getHTML()
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