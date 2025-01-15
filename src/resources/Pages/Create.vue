<template>
  <va-create-layout 
    :title="title"
    disable-card
    disable-title
  >
    <pages-form :item="item"></pages-form>
  </va-create-layout>
</template>

<script>
export default {
  props: ["title", "item"],
}
</script>
