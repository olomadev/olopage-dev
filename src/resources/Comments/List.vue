<template>
  <div> 
    <va-list 
      disable-create
      disable-settings
      row-create
      :fields="fields"
      :filters="filters"
      :items-per-page="200"
    >
      <va-data-table-server
        row-create
        row-clone
        row-edit
        disable-edit
        disable-show
        disable-clone
        disable-create-redirect
      >
      </va-data-table-server>
    </va-list>
  </div>
</template>

<script>
import { required } from "@vuelidate/validators";

export default {
  props: ["resource", "title"],
  inject: [],
  provide() {
    return {
      validations: {
        form: {
          published: {
            required
          },
        }
      },
      errors: {
        publishedErrors: (v$) => {
          const errors = [];
          if (!v$['form'].method.$dirty) return errors;
          v$['form'].method.required.$invalid &&
            errors.push(this.$t("v.text.required"));
          return errors;
        },
      }
    };
  },
  data() {
    return {
      groupBy: [{ key: 'postTitle' }],
      selected: [],
      filters: [],
      fields: [
        {
          source: "data-table-group",
          label: this.$t("va.datatable.group"),
          sortable: false,
        },
        {
          source: "postTitle",
          sortable: true,
        },
        {
          source: "body",
          sortable: true,
        },
        {
          source: "name",
          sortable: true,
        },
        {
          source: "email",
          type: "select",
          attributes: {
            reference: "actions",
          },
          sortable: true,
        },
        {
          source: "published",
          sortable: true,
        },
      ],
    };
  }
};
</script>

