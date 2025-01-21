<template>
  <button
    type="button"
    :class="[ 
      'inline-flex h-8 w-8 shrink-0 flex-row items-center justify-center rounded-md disabled:bg-transparent disabled:text-gray-300',
      isActive 
        ? 'bg-blue-200 text-blue-800 hover:bg-opacity-80' 
        : 'text-gray-600 hover:bg-blue-50'
    ]"
    :aria-label="label"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>
