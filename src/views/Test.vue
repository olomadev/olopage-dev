<template>
  <div @click="showBubbleMenu">
    <editor-content :editor="editor" />
  </div>

  <!-- Bubble Menü -->
  <div v-if="isBubbleMenuVisible" ref="bubbleMenuRef" class="bubble-menu" :style="{ left: `${menuX}px`, top: `${menuY}px` }">
    <button @click="addRowBefore">Üstüne Satır Ekle</button>
    <button @click="addRowAfter">Altına Satır Ekle</button>
    <button @click="deleteRow">Satırı Sil</button>
    <hr />
    <button @click="addColumnBefore">Soluna Sütun Ekle</button>
    <button @click="addColumnAfter">Sağına Sütun Ekle</button>
    <button @click="deleteColumn">Sütunu Sil</button>
  </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

export default {
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: null,
      isBubbleMenuVisible: false,
      menuX: 0,
      menuY: 0,
    };
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: `
        <p>Tabloya tıklayın!</p>
        <table>
          <tbody>
            <tr>
              <td>A</td>
              <td>B</td>
            </tr>
            <tr>
              <td>C</td>
              <td>D</td>
            </tr>
          </tbody>
        </table>
      `,
    });
  },
  methods: {
    showBubbleMenu(event) {
      const { target } = event;
      if (target.tagName !== "TD" && target.tagName !== "TH") {
        this.isBubbleMenuVisible = false;
        return;
      }
      this.menuX = event.clientX;
      this.menuY = event.clientY;

      this.isBubbleMenuVisible = true;
    },
    addRowAfter() {
      this.editor.chain().focus().insertTableRowAfter().run();
    },
    addRowBefore() {
      this.editor.chain().focus().insertTableRowBefore().run();
    },
    deleteRow() {
      this.editor.chain().focus().deleteRow().run();
    },
    addColumnBefore() {
      this.editor.chain().focus().addColumnBefore().run();
    },
    addColumnAfter() {
      this.editor.chain().focus().addColumnAfter().run();
    },
    deleteColumn() {
      this.editor.chain().focus().deleteColumn().run();
    },
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  },
};
</script>

<style>
/* Tabloların temel stilleri */
table {
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

/* Bubble Menü için temel stiller */
.bubble-menu {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  padding: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.bubble-menu button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  text-align: left;
  width: 100%;
}

.bubble-menu hr {
  margin: 5px 0;
}
</style>
