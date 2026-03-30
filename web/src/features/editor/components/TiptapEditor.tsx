import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
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
    <div className="w-full bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 shadow-inner transition-all hover:border-emerald-500/10 active:border-emerald-500/20">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor
