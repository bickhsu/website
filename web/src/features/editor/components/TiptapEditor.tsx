import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Type something...</p>',
  })

  return (
    <div className="prose prose-invert max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor

