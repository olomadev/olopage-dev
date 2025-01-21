<template>
  <v-row no-gutters class="mb-2 blockeditor-form">    
    <v-col cols="12" md="8" lg="9" sm="12">
      <v-card :loading="loading" flat border height="100%" min-height="600" class="d-flex flex-column">
        <v-card-title class="mt-3 d-flex">

          <v-btn-toggle v-model="htmlMode">
            <v-btn variant="outlined" class="text-none">
              <v-icon size="large">mdi-code-tags</v-icon>&nbsp;&nbsp;Html View
            </v-btn>
          </v-btn-toggle>

          <!-- <v-alert v-if="message.top" density="compact"  class="alerts" :text="message.text" :type="message.type" :icon="false" variant="tonal" /> -->
          <v-spacer />
          <div style="height: 30px">
            <v-menu v-if="previewable">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
              </template>
              <v-list elevation="2">
                <template v-for="(item, index) in getMenuItems" :key="index">
                  <v-list-item
                    @click="menuItemClick(item, item.value)"
                  >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>
          </div>
        </v-card-title>
        <v-card-text>
          <PageEditor 
            :key="editorKey"
            :htmlMode="htmlMode"
            :admin="this.$admin"
            :postId="this.model.id"
            editorClass="py-2 prose xl:prose-xl text-slate-800 max-w-none"
            v-model="model.contentJson"
            :editable="editable"
            mode="json"
            :blockTools="blockTools"
            :blockWidthTypes="['horizontalRule', 'blockquote', 'youtube']"
            @uploadedImage="uploadedImage"
            @deletedImage="deletedImage"
            @updateHtmlContent="setHtmlContent"
          />

        </v-card-text>
        <template #actions>
          <v-row class="d-flex">
            <v-col cols="6" class="pl-5">
              <v-alert v-if="message.bottom" density="compact" max-height="30" class="alerts" :text="message.text" :type="message.type" :icon="false" variant="tonal" />
            </v-col>
            <v-col cols="6" class="pr-5" id="posts-permalink-url" align="right" justify="right" v-if="model.permalink">
              <a href="javascript:void(0)">{{ getFrontendBaseUrl }}/{{ model.permalink }}</a>
            </v-col>
          </v-row>
        </template>
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
<!--   <v-dialog v-model="editPermalinkDialog" width="auto" :fullscreen="smAndDown">
    <v-card :min-width="dialogWidth">
      <v-card-title class="text-h5">{{ $t('resources.posts.permalink-dialog-title') }}</v-card-title>
      <v-card-text>
        <v-text-field density="compact" :prefix="getFrontendBaseUrl + '/'" v-model="model.permalink" counter="255" />
      </v-card-text>
      <v-card-actions>
        <v-btn class="ms-auto" text @click="editPermalinkDialog = false">{{ $t('va.actions.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>   -->
</template>

<script>
import { provide } from 'vue';
import { useDisplay } from 'vuetify';
import PageEditor from '@/components/page-editor/PageEditor.vue';
import Utils from 'olobase-admin/src/mixins/utils';
import { vMaska } from 'maska/vue';
import Pages from "@/mixins/pages";
import { formatDate, blockTools } from "@/utils";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

export default {
  props: ['id', 'item'],
  mixins: [Utils, Pages],
  directives: { maska: vMaska },
  components: { PageEditor },
  setup() {
    const { smAndDown } = useDisplay();
    provide('v$', useVuelidate() )
    return { v$: useVuelidate(), smAndDown }
  },
  created() {
    const Self = this
    this.model.id = this.generateId(this);
    this.previewable = this.$router.currentRoute.value.path === "/pages/create" ? false : true;
  },
  mounted() {
    if (this.item) {
      this.model.route = this.item.route;
      this.model.title = this.item.title;
      this.model.keywords = this.item.keywords;
      this.model.description = this.item.description;
      this.model.contentJson = this.item.contentJson;
      this.model.contentHtml = this.item.contentHtml;
      this.model.publishStatus = this.item.publishStatus;
      ++this.editorKey;
    }
  },
  data() {
    return {
      loading: false,
      loadingPublish: false,
      editorKey: 0,      
      draftId: null,
      editable: true,
      message: { show: false, type: "error", text: "" },
      previewable: false,
      htmlMode: null,
      model: {
        id: null,
        route: null,
        title: null,
        keywords: [],
        description: null,
        contentJson: [
          {
            "type": "heading", "attrs": {"textAlign": "left", "level": 1 },
            "content": [ { "type": "text", "text": "Type your title here .." } ]
          },
        ],
        contentHtml: null,
        publishStatus: "draft",
      },
      blockTools: blockTools(),
    };
  },
  validations() {
    return {

    }
  },
  watch: {
    "model.contentJson"(val) {
      // if (
      //   Array.isArray(val) &&
      //   val[0]?.content &&
      //   val[0]?.type === "heading" &&
      //   val[0]?.content[0]?.text
      // ) {
      //   const text = val[0].content[0].text;
      //   this.model.title = text;
      //   this.model.permalink = this.item ? this.item.permalink : this.setPermalink(text)    
      //   this.model.description = this.item ? this.item.description : this.setDescription(val)    
      // } else {
      //   this.model.permalink = null;
      //   this.model.description = null;
      // }
    },
  },
  methods: {
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
    async create() {
      // try {
      //   this.model.publishedAt = formatDate("Y-m-d H:i:s")
      //   this.model.publishDate = formatDate("Y-m-d")
      //   this.model.publishTime = formatDate("H:i")
      //   const res = await this.$admin.http({ method: "POST", url: "/posts/create", data: this.model });
      //   if (res && res.status === 200) {
      //     this.previewable = true;
      //     this.model.permalink = res?.data?.data['permalink'] ? res?.data?.data['permalink'] : this.model.permalink;
      //     this.showMessage("success", this.$t("resources.posts.messages.postCreatedSuccessfully"))
      //   }
      // } catch (error) {
      //   console.error("Create error:", error);
      // }
    },
    async update() {
      try {
        const res = await this.$admin.http({ method: "PUT", url: `/pages/update/${this.model.id}`, data: this.model });
        if (res && res.status === 200) {
          this.previewable = true;
          // this.showMessage("success", this.$t("resources.pages.messages.pageUpdatedSuccessfully"))
        }
      } catch (error) {
        console.error("Update error:", error);
      }
    },
    uploadedImage(fileName) {
      const saveButton = this.$refs?.saveButton?.$el;
      if (saveButton) {
        saveButton.click();
      }
    },
    deletedImage() {
      const saveButton = this.$refs?.saveButton?.$el;
      if (saveButton) {
        saveButton.click();
      }
      this.model.featuredImageId = null;
    }
  },
};
</script>

<style>

</style>