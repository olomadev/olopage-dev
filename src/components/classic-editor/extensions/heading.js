import { Heading as TiptapHeading } from '@tiptap/extension-heading';
import ActionMenuButton from '../ActionMenuButton.vue';

export const Heading = TiptapHeading.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2, 3, 4, 5, 6],
      button: ({ editor, extension, t }) => {
        const { extensions = [] } = editor.extensionManager ?? [];
        const levels = extension.options?.levels || [];
        const baseKitExt = extensions.find(k => k.name === 'base-kit');

        const items = levels.map(level => ({
          action: () => { 
            if (editor.can().toggleHeading({ level })) {
              editor.chain().focus().toggleHeading({ level }).run();
            } else {
              console.warn('Cannot toggle heading at level:', level);
            }
          },
          isActive: () => editor.isActive('heading', { level }) || false,
          disabled: !editor.can().toggleHeading({ level }),
          icon: `mdi-format-header-${level}`,
          title: t[`h${level}`],
        }));

        if (baseKitExt && baseKitExt.options.paragraph !== false) {
          items.unshift({
            action: () => editor.chain().focus().setParagraph().run(),
            isActive: () => editor.isActive('paragraph') || false,
            disabled: !editor.can().setParagraph(),
            icon: 'mdi-format-header-pound',
            title: t.h,
            divider: true,
          });
        }

        const disabled = items.filter(k => k.disabled).length === items.length;

        return {
          component: ActionMenuButton,
          componentProps: {
            icon: 'mdi-format-header-pound',
            tooltip: t.h,
            disabled,
            items,
          }
        };
      }
    };
  }
});
export default Heading;