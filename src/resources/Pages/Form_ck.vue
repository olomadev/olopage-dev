<template>
  <v-row no-gutters class="mb-2">    

    <v-col cols="12" md="8" lg="9" sm="12">
      <va-form :id="id" :item="item" v-model="model">
        <v-row no-gutters class="classiceditor-form">
          <v-col>

            <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>

<!--               <va-text-input
              source="route"
              :error-messages="routeErrors"
            ></va-text-input>

            <va-text-input
              source="title"
              :error-messages="titleErrors"
            ></va-text-input>

            <va-auto-complete-input 
              source="keywords"
              reference="keywords" 
              multiple 
              chips 
              taggable 
              closable-chips
            >
            </va-auto-complete-input>

            <va-text-input
              source="description"
              multiline
            ></va-text-input>

            <va-boolean-input
              source="publishStatus"
              hide-details
            ></va-boolean-input> -->


          </v-col>
        </v-row>
        <!-- <va-save-button></va-save-button> -->
      </va-form>
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
            <v-row no-gutters class="mb-2">
              <v-col cols="12">
                <v-btn ref="saveButton" block flat prepend-icon="mdi-content-save" color="secondary" @click.stop="save">
                  {{ $t('va.actions.save') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </v-col>

  </v-row>
</template>

<script>
import { provide } from 'vue';
import { useDisplay } from 'vuetify';
import { useVuelidate } from "@vuelidate/core";
import { required, email, minLength, maxLength } from "@vuelidate/validators";
import Utils from "olobase-admin/src/mixins/utils";
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import ClassicEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { ClassicEditor, FullPage } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';
import { Ckeditor, } from '@ckeditor/ckeditor5-vue';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

export default {
  props: ["id", "item"],
  mixins: [Utils],
  components: {
    ckeditor: Ckeditor,
  },
  setup() {
    let vuelidate = useVuelidate();
    const { smAndDown } = useDisplay();
    provide('v$', vuelidate)
    return { v$: vuelidate, smAndDown }
  },
  validations: {
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
    }
  },
  data() {
    return {
      editor: ClassicEditor,
      editorData: '<p>Type your content here!</p>',
      editorConfig: {
        licenseKey: 'GPL',
        plugins: [ FullPage ],
      },
      loading: false,
      previewable: false,
      loadingPublish: false,
      model: {
        id: null,
        route: null,
        title: null,
        keywords: null,
        description: null,
        publishStatus: 0,
      },
    };
  },
  created() {
    this.model.id = this.generateId(this);
    if (!this.id) {
      this.model.password = this.generatePassword(8);
    }
  },
  computed: {
    async save() {
      // const Self = this;
      // this.loading = false
      // if (this.model.contentHtml === '<p></p><p></p>') {
      //   Self.$admin.message('warning', this.$t("resources.posts.messages.postEmptyContentError"));
      //   return;
      // }
      // if (!this.model.permalink) {
      //   Self.$admin.message('warning', this.$t("resources.posts.messages.postHeadingError"));
      //   return;
      // }
      // this.loading = "primary";
      // let response = null;
      // if (! this.previewable && this.draftId != this.model.id) { // check record exists
      //   try {
      //     await this.$admin.http({ method: "GET", url: `/posts/findOneById/${this.model.id}` }).then(function(res) {
      //       if (res 
      //           && res?.data?.data?.publishedAt 
      //           && res.data.data.publishedAt
      //           && typeof res.data.data.publishedAt === "string") {
      //           const [datePart, timePart] = res.data.data.publishedAt.split(' ');
      //           Self.model.publishedAt = res.data.data.publishedAt;
      //           Self.model.publishedDate = datePart;
      //           Self.model.publishedTime = timePart;  
      //       }
      //     });
      //     await this.update();
      //   } catch (error) {
      //     if (error.status == 404) {
      //       await this.create();
      //       this.draftId = this.model.id; // save as draft
      //     }
      //     this.loading = false;
      //   }
      // } else {
      //   await this.update();
      // }
      // this.loading = false;
    },
    publishStatusIcon() {
      return this.model.publishStatus === 'published' ? 'mdi-publish-off' : 'mdi-publish';
    },
    publishStatusColor() {
      return this.model.publishStatus === 'published' ? 'red-darken-2' : null;
    },
    publishStatusText() {
      return this.model.publishStatus === 'published' ? this.$t('resources.posts.unpublish') : this.$t('resources.posts.publish');
    },
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
    },
    async togglePublish() {
      this.loadingPublish = "primary"
      this.model.publishStatus = this.model.publishStatus === 'published' ? 'draft' : 'published';
      // await this.$admin.http(
      //   { 
      //     method: "PATCH", 
      //     url: "/posts/publish/" + this.model.id, 
      //     params: { publishStatus: this.model.publishStatus, publishedAt: this.model.publishedAt }
      //   }
      // );
      const message = this.model.publishStatus === 'published' ? this.$t("resources.posts.messages.postPublished") : this.$t("resources.posts.messages.postUnpublished")
      // this.showMessage("info", message)
      this.loadingPublish = false
    },
  },
}
</script>

<style>
.classiceditor-form {
  background-color: white;
}
.ck-editor__editable {
  min-height: 200px;
}
</style>