<template>
  <Dialog title="$t('classiceditor.selectedImage')" :show="show" @close="closeDialog">
    <div v-bind="getRootProps()" class="rounded-lg border border-gray-300 p-4">
      <input v-bind="getInputProps()" />
      <div
        v-if="imageListRef?.length > 0"
        class="grid grid-cols-3 gap-3 sm:grid-cols-4"
      >
        <button
          @click="insertImage(image.Url)"
          type="button"
          v-for="image in imageListRef"
          :key="image.Name"
          class="rounded-md border border-gray-300 p-1"
        >
          <img
            alt=""
            :src="image.Url"
            class="aspect-square object-scale-down object-center"
          />
        </button>
      </div>
      <div
        :class="[isDragActive ? 'bg-gray-100' : '', imageListRef?.length > 0 ? 'mt-4 ' : '']"
        class="rounded-lg border border-dashed border-gray-300 px-8 py-12"
      >
        <p
          v-if="isDragActive"
          class="text-center text-sm font-medium text-gray-700"
        >
          {{ $t('classiceditor.imageDropText') }}
        </p>
        <p v-else class="text-center text-sm font-medium text-gray-700">
          {{ $t('classiceditor.imageUploadText') }}
        </p>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "./Dialog.vue"
import axios from "axios"
import { useDropzone } from "vue3-dropzone"

export default {
  components: {
    Dialog,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      image: {
        Url: null,
      },
      imageListRef: [], // Array to hold the images
      isDragActive: false, // To track if drag is active
    }
  },
  methods: {
    closeDialog() {
      this.$emit("close")
    },
    onDropImage(acceptedFiles) {
      if (acceptedFiles.length === 0) {
        return
      }

      const formData = new FormData()
      formData.append("file", acceptedFiles[0])

      axios
        .post("http://localhost:8080/files", formData, {
          headers: {
            "Content-type": "multipart/form-data",
          },
        })
        .then(() => {
          this.loadData()
        })
    },
    loadData() {
      axios.get("http://localhost:8080/files").then((result) => {
        this.imageListRef = result.data
      })
    },
    insertImage(url) {
      this.$emit("insert", url)
      this.closeDialog()
    },
    // Method to get dropzone properties
    getRootProps() {
      return this.dropzone.getRootProps()
    },
    getInputProps() {
      return this.dropzone.getInputProps()
    },
  },
  mounted() {
    this.dropzone = useDropzone({
      accept: "image/png,image/jpeg,image/gif,image/webp",
      multiple: false,
      onDrop: this.onDropImage,
      noClick: true,
    })
    this.loadData()
  },
}
</script>
