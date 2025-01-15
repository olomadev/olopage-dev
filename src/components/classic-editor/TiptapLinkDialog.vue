<template>
  <Dialog title="$t('classiceditor.addLink')" :show="show" @close="closeDialog">
    <form @submit.prevent="update">
      <div class="flex flex-col space-y-5">
        <InputContainer>
          <Label for="input-link-url">{{ $t('classiceditor.linkUrl') }}</Label>
          <Input type="url" id="input-link-url" v-model="inputLinkRef" />
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
import Label from "./Label.vue"
import Input from "./Input.vue"
import InputContainer from "./InputContainer.vue"

export default {
  components: {
    Dialog,
    Label,
    Input,
    InputContainer
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    currentUrl: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      inputLinkRef: "",
    }
  },
  watch: {
    currentUrl(newValue) {
      this.inputLinkRef = newValue || ""
    }
  },
  methods: {
    closeDialog() {
      this.$emit("close")
    },
    update() {
      this.$emit("update", this.inputLinkRef)
      this.$emit("close")
    },
  },
  mounted() {
    this.inputLinkRef = this.currentUrl || ""
  }
}
</script>
