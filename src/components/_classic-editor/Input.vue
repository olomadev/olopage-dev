<template>
  <input v-model="proxyModel" class="rounded-md border border-gray-400 px-3 py-2 text-gray-800 focus:ring-blue-800" />
</template>

<script>
export default {
  props: {
    modelValue: {
      type: [String, Number],
      required: false,
    },
  },
  data() {
    return {
      // A computed property to act as a proxy for the v-model binding
      proxyModel: this.modelValue || "",
    };
  },
  watch: {
    // Watch for changes to modelValue prop
    modelValue(newValue) {
      this.proxyModel = newValue || "";
    },
    // Watch for changes to the proxyModel and emit to parent component
    proxyModel(newValue) {
      this.$emit("update:modelValue", newValue);
    },
  },
}
</script>
