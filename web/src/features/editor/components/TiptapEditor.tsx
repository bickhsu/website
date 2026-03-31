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
        // 加入自定義 CSS 來壓掉 prose 預設給 img 的巨大 margin
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[2rem] p-0 [&_img]:my-0 [&_img]:inline-block',
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items || [])
        for (const item of items) {
          if (item.type.startsWith('image')) {
            const file = item.getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const previewUrl = e.target?.result as string
                
                // 改用更精確的「取代選取區域」方式，避免被包在新的 p 裡
                if (editor) {
                  const { state, dispatch } = editor.view
                  const { tr, schema } = state
                  const node = schema.nodes.image.create({ src: previewUrl })
                  
                  // 直接插入，不使用高階的 insertContent 以免觸發段落修復機制
                  dispatch(tr.replaceSelectionWith(node).scrollIntoView())

                  handleImageUpload(file).then((remoteUrl) => {
                    if (remoteUrl) {
                      const latestState = editor.view.state
                      latestState.doc.descendants((n, pos) => {
                        if (n.type.name === 'image' && n.attrs.src === previewUrl) {
                          editor.view.dispatch(
                            latestState.tr.setNodeMarkup(pos, undefined, {
                              ...n.attrs,
                              src: remoteUrl,
                            })
                          )
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
        }
        return false
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const previewUrl = e.target?.result as string
              if (editor) {
                const { view } = editor
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const { tr, schema } = view.state
                  const node = schema.nodes.image.create({ src: previewUrl })
                  view.dispatch(tr.insert(coordinates.pos, node))

                  handleImageUpload(file).then((remoteUrl) => {
                    if (remoteUrl) {
                      const latestState = view.state
                      latestState.doc.descendants((n, pos) => {
                        if (n.type.name === 'image' && n.attrs.src === previewUrl) {
                          view.dispatch(
                            latestState.tr.setNodeMarkup(pos, undefined, {
                              ...n.attrs,
                              src: remoteUrl,
                            })
                          )
                        }
                      })
                    }
                  })
                }
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
