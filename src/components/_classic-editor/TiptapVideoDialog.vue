<template>
  <Dialog :title="$t('classiceditor.addYoutubeVideo')" :show="show" @close="closeDialog">
    <form @submit.prevent="onSubmit">
      <div class="flex flex-col space-y-5">
        <InputContainer>
          <Label for="input-add-youtube-url">{{ $t('classiceditor.youtubeVideoUrl') }}</Label>
          <Input
            type="url"
            id="input-add-youtube-url"
            v-model="inputYoutubeUrlRef"
            required
          />
        </InputContainer>
        <div class="flex flex-row justify-end space-x-3">
          <button
            type="button"
            class="rounded-md px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
            @click="closeDialog"
          >
            {{ $t('va.actions.cancel') }}
          </button>
          <button
            type="submit"
            class="rounded-md bg-blue-700 px-4 py-3 text-sm font-medium text-white hover:bg-opacity-80"
          >
            {{ $t('va.actions.add') }}
          </button>
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script>
import Dialog from "./Dialog.vue"
import InputContainer from "./InputContainer.vue"
import Input from "./Input.vue"
import Label from "./Label.vue"

export default {
  components: {
    Dialog,
    InputContainer,
    Input,
    Label
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      inputYoutubeUrlRef: "", // reactive variable to store the youtube URL
    }
  },
  methods: {
    closeDialog() {
      this.$emit("close")
    },
    onSubmit() {
      this.$emit("insert", this.inputYoutubeUrlRef)
      this.inputYoutubeUrlRef = "" // clear the input field
      this.closeDialog()
    },
  },
}
</script>
