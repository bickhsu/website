import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'

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
        // Tailwind prose classes for the internal Tiptap area
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  // 當外部 content 改變且與目前編輯器內容不符時，主動更新編輯器 (例如加載歷史記錄)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-gray-900/10 shadow-lg h-full">
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-auto bg-gray-900/30">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}


export default TiptapEditor
