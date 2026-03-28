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
