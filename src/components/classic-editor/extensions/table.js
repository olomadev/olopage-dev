import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TableActionButton from '../TableActionButton.vue';
import { Plugin, PluginKey } from "prosemirror-state";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";

export const Table = TiptapTable.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      resizable: true,
      bubbleMenuPlugin: true,
      HTMLAttributes: {
        class: 'table-wrapper'
      },
      button: ({ editor, t }) => ({
        component: TableActionButton,
        componentProps: {
          isActive: () => editor.isActive('table') || false,
          disabled: !editor.can().insertTable(),
          icon: 'mdi-table',
          tooltip: t('editor.table.tooltip'),
          id: 'table-insert-button',
        }
      })
    };
  },
  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];

    // custom buble menu plugin for table extension
    if (this.options.bubbleMenuPlugin) {
      plugins.push(
        new Plugin({
          key: new PluginKey("bubbleMenu"),
          props: {
            handleDOMEvents: {
              click: (view, event) => {
                const { target } = event;

                // Eğer tablo hücresine tıklanmışsa
                if (target.tagName !== "TD" && target.tagName !== "TH") return false;

                const bubbleMenu = document.getElementById("bubble-menu");
                if (!bubbleMenu) return false;

                // Bubble menüyü mouse'un konumuna yerleştir
                const rect = bubbleMenu.getBoundingClientRect();
                const rowRect = target.closest("tr").getBoundingClientRect();
                bubbleMenu.style.left = `${rowRect.right + window.scrollX - rect.width - 210}px`;
                bubbleMenu.style.top = `${rowRect.bottom + window.scrollY - 122}px`;

                bubbleMenu.style.display = "block"; // show menu
                window.selectedEditor = view;
                return true;
              },
            },
          },
        })
      );
    }
    return plugins;
  },
  addExtensions() {
    return [
      TableRow.configure(this.options.tableRow),
      TableHeader.configure(this.options.tableHeader),
      TableCell.configure(this.options.tableCell)
    ];
  },
});
export default Table;