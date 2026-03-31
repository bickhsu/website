import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu'
import { Palette } from 'lucide-react'

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
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

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      BubbleMenuExtension,
      Image.configure({
        inline: true,
        allowBase64: true, 
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[2rem] p-0',
      },
    },
  })

  // 當外部 content 改變且與目前編輯器內容不符時，主動更新編輯器
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="w-full bg-transparent hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] rounded-2xl px-4 py-0.5 transition-all group relative">
      {editor && (
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
