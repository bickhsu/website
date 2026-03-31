import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { uploadImage } from '../utils/uploadImage'

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImage(file)
      return url
    } catch (error) {
      console.error('Failed to upload image:', error)
      return null
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false, // 禁用 base64，強制雲端儲存
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
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || [])
        for (const item of items) {
          if (item.type.startsWith('image')) {
            const file = item.getAsFile()
            if (file) {
              // 1. 先顯示本地預覽 (Base64)
              const reader = new FileReader()
              reader.onload = (e) => {
                const previewUrl = e.target?.result as string
                const { schema } = view.state
                const node = schema.nodes.image.create({ src: previewUrl })
                const transaction = view.state.tr.replaceSelectionWith(node)
                view.dispatch(transaction)

                // 2. 在背景上傳到後端
                handleImageUpload(file).then((remoteUrl) => {
                  if (remoteUrl) {
                    // 3. 上傳成功後，找到剛才插入的圖片並替換其 src
                    view.state.doc.descendants((node, pos) => {
                      if (node.type.name === 'image' && node.attrs.src === previewUrl) {
                        const tr = view.state.tr.setNodeMarkup(pos, undefined, {
                          ...node.attrs,
                          src: remoteUrl,
                        })
                        view.dispatch(tr)
                      }
                    })
                  }
                })
              }
              reader.readAsDataURL(file)
              return true
            }
          }
        }
        return false
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image')) {
            // 讀取本地預覽
            const reader = new FileReader()
            reader.onload = (e) => {
              const previewUrl = e.target?.result as string
              const { schema } = view.state
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (coordinates) {
                const node = schema.nodes.image.create({ src: previewUrl })
                const transaction = view.state.tr.insert(coordinates.pos, node)
                view.dispatch(transaction)

                // 背景上傳
                handleImageUpload(file).then((remoteUrl) => {
                  if (remoteUrl) {
                    view.state.doc.descendants((node, pos) => {
                      if (node.type.name === 'image' && node.attrs.src === previewUrl) {
                        const tr = view.state.tr.setNodeMarkup(pos, undefined, {
                          ...node.attrs,
                          src: remoteUrl,
                        })
                        view.dispatch(tr)
                      }
                    })
                  }
                })
              }
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
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
    <div className="w-full bg-transparent hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] rounded-2xl px-4 py-0.5 transition-all group">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor
