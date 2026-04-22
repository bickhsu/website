import React, { useEffect } from 'react'
import { InputRule } from '@tiptap/core'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Link } from '@tiptap/extension-link'
import { TableKit } from '@tiptap/extension-table'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import ImageResize from 'tiptap-extension-resize-image'
import { all, createLowlight } from 'lowlight'
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu'
import { Palette, Link2, Table2, Code2, CheckSquare } from 'lucide-react'

const lowlight = createLowlight(all)

interface TiptapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

const COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Kirby Pink', value: '#d9717f' },
  { name: 'Soft Pink', value: '#ffb6d8' },
  { name: 'Kirby Dark', value: '#ff85c0' },
  { name: 'Sky Blue', value: '#60a5fa' },
  { name: 'Mint Green', value: '#34d399' },
  { name: 'Gold', value: '#fbbf24' },
]

const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'sql', 'bash', 'yaml', 'json', 'markdown', 'plaintext']

// --- Define Extensions Outside Component for Stability ---
const CustomLink = Link.extend({
  name: 'customLink',
  addInputRules() {
    return [
      new InputRule({
        find: /\[([^\]]+)\]\(([^)]+)\)\s$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;
          const label = match[1];
          const href = match[2];

          if (label && href) {
            tr.replaceWith(start, end, state.schema.text(label, [
              state.schema.marks.link.create({ href }),
            ]));
            tr.insert(start + label.length, state.schema.text(' '));
          }
        },
      }),
    ];
  },
});

const getExtensions = () => [
  StarterKit.configure({
    codeBlock: false,
  }),
  TextStyle,
  Color,
  TaskList,
  TaskItem.configure({
    nested: true,
    onReadOnly: false,
  }),
  BubbleMenuExtension,
  TableKit.configure({
    table: {
      resizable: true,
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  CustomLink.configure({
    openOnClick: false,
    autolink: false,
    defaultProtocol: 'https',
    HTMLAttributes: {
      class: 'text-brand-400 no-underline border-b border-brand-500/30 hover:border-brand-500 transition-all cursor-pointer',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  ImageResize.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded-lg shadow-sm',
    },
  }),
];

const TiptapEditor = ({ content, onChange, editable = true }: TiptapEditorProps) => {
  const extensions = React.useMemo(() => getExtensions(), []);
  
  const editor = useEditor({
    editable,
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert prose-p:text-xs prose-p:my-1 prose-headings:text-sm prose-li:text-xs max-w-none focus:outline-none min-h-[2rem] p-0',
      },
    },
  })

  // 使用一個稍微寬鬆的條件來檢查 HTML 是否真的改變，避免無限迴圈
  useEffect(() => {
    if (!editor) return;
    
    const safeContent = content || "";
    const currentHTML = editor.getHTML();
    if (safeContent !== currentHTML) {
      // 只有在內容真的不同時才更新，且避免在正在輸入時強制更新
      const isSame = currentHTML.replace(/\s/g, '') === safeContent.replace(/\s/g, '');
      if (!isSame) {
        editor.commands.setContent(safeContent, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  // 同步 editable 狀態
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <div className="w-full relative">
      {editor && editable && (
        <BubbleMenu editor={editor} options={{ duration: 100 } as any}>
          <div className="flex items-center gap-1.5 p-1.5 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-1 border-r border-gray-800 pr-1.5 mr-1 pt-0.5 pb-0.5">
              <button 
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-[10px] font-black uppercase ${editor.isActive('bold') ? 'text-brand-500 bg-brand-500/10' : 'text-gray-400'}`}
              >
                B
              </button>
              <button 
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-[10px] font-black uppercase italic ${editor.isActive('italic') ? 'text-brand-500 bg-brand-500/10' : 'text-gray-400'}`}
              >
                I
              </button>
              <button 
                onClick={() => {
                  if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run()
                  } else {
                    const url = window.prompt('URL')
                    if (url) editor.chain().focus().setLink({ href: url }).run()
                  }
                }}
                className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors ${editor.isActive('link') ? 'text-brand-500 bg-brand-500/10' : 'text-gray-400'}`}
                title="連結"
              >
                <Link2 size={12} />
              </button>
              <button 
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400"
                title="插入表格 (3x3)"
              >
                <Table2 size={12} />
              </button>
              <button 
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors ${editor.isActive('codeBlock') ? 'text-brand-500 bg-brand-500/10' : 'text-gray-400'}`}
                title="程式碼區塊"
              >
                <Code2 size={12} />
              </button>
              <button 
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors ${editor.isActive('taskList') ? 'text-brand-500 bg-brand-500/10' : 'text-gray-400'}`}
                title="待辦事項"
              >
                <CheckSquare size={12} />
              </button>

              {editor.isActive('codeBlock') && (
                <select
                  value={editor.getAttributes('codeBlock').language || 'plaintext'}
                  onChange={e => editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()}
                  className="bg-gray-800 border border-gray-700 text-[10px] text-gray-300 px-2 py-1 rounded-md ml-2 focus:outline-none focus:border-brand-500 capitalize"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Palette size={12} className="text-gray-600 ml-1 mr-0.5" />
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    if (c.value === 'inherit') {
                      editor.chain().focus().unsetColor().run()
                    } else {
                      editor.chain().focus().setColor(c.value).run()
                    }
                  }}
                  className="w-4 h-4 rounded-full border border-gray-800 hover:scale-125 transition-transform hover:border-white/20 active:scale-95"
                  style={{ backgroundColor: c.value === 'inherit' ? '#e0e0e0' : c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor
