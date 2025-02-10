<template>
  <va-list 
    :fields="fields"
    :filters="filters"
    disable-settings
  >
    <va-data-table-server 
      disable-show
      disable-edit
      :show-expand="true"
      :expand-on-click="true"
      :disable-actions="false"
       row-save-dialog
       row-save-dialog-width="600"
       row-save-dialog-height="700"
    >
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <div class="comment-text">
              <span v-html="getHtml(item.body)"></span>
            </div>
          </td>
        </tr>
      </template>
    </va-data-table-server>
  </va-list>
</template>

<script>
import { marked } from "marked";
import hljs from 'highlight.js';

export default {
  props: ["resource", "title"],
  setup() {
    marked.use({
      gfm: true,
      breaks: true,
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    });
    return { marked };
  },
  data() {
    return {
      filters: [],
      fields: [
        {
          source: "createdAt",
          sortable: true,
        },
        {
          source: "name",
          sortable: true,
        },
        {
          source: "postTitle",
          sortable: true,
        },
        {
          source: "published",
          sortable: true,
        },
      ],
    };
  },
  methods: {
    getHtml(html) {
      return marked.parse(html); // Güncellenmiş `marked` fonksiyonunu kullan
    }
  }
};
</script>

<style>
.comment-text {
  padding: 10px;
}
.comment-text p {
  font-size: 13px;
}
.comment-text pre {
  font-size: 12px;
  background-color: #f4f4f4;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.comment-text {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
.comment-text strong {
  font-weight: bold;
}
.comment-text em {
  font-style: italic;
}
.comment-text blockquote {
  background-color: #f8f9fa;
  border-left: 5px solid gray;
  padding: 5px 20px;
  font-style: italic;
  color: #555;
}
.comment-text ul {
  padding-left: 20px;
}
.comment-text li {
  font-size: 12px;
  list-style-type: disc;
  margin-bottom: 5px;
}
.comment-text u {
  text-decoration: underline;
}
</style>