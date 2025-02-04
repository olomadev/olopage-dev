<template>
  <div>
    <va-list
      :filters="filters"
      :fields="fields"
      disable-create
      disable-positioning
      disable-visibility
      :items-per-page="2"
    >
      <va-data-table-server
        :disable-actions="false"
        disable-edit
        disable-clone
        disable-show
      >
      </va-data-table-server>
    </va-list>
  </div>
</template>

<script>
export default {
  props: ["resource", "title"],
  data() {
    return {
      filters: [
        {
          source: "username",
          type: "select",
          attributes: {
            reference: "failedloginusernames",
            multiple: true,  
          }
        },
        {
          source: "ip",
          type: "select",
          attributes: {
            reference: "failedloginips",
            multiple: true,  
          }
        },
        {
          source: "attemptedAtStart",
          type: "date",
        },
        {
          source: "attemptedAtEnd",
          type: "date",
        }
      ],
      fields: [
        {
          source: "username",
          type: "text",
          sortable: true,
          width: "10%"
        },
        {
          source: "ip",
          sortable: true,
          width: "10%"
        },
        {
          source: "attemptedAt",
          type: "date",
          sortable: true,
          width: "10%"
        },
        {
          source: "userAgent",
          sortable: true,
          width: "50%"
        },
      ],
    };
  }
};
</script>
