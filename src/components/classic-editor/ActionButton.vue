<template>
  <v-btn
    class="rounded me-1 ms-0"
    density="compact"
    size="small"
    :disabled="disabled"
    :color="color"
    icon
    :class="{
      'v-btn--active': isActive && isActive()
    }"
    @click="action"
  >
    <v-icon icon="mdi-image-plus"></v-icon>
    <v-tooltip :eager="false" activator="parent" location="top" :text="tooltip"></v-tooltip>
    <slot></slot>
  </v-btn>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'ButtonComponent', // Gerekirse component adını belirleyin
  props: {
    icon: {
      type: String,
      default: undefined,
    },
    tooltip: {
      type: String,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: undefined,
    },
    action: {
      type: Function,
      default: undefined,
    },
    isActive: {
      type: Function,
      default: undefined,
    },
  },
};
</script>
