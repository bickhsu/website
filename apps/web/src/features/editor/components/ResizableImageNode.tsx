import React, { useState, useCallback, useEffect, useRef } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

const ResizableImageNode = (props: NodeViewProps) => {
  const { node, updateAttributes, selected } = props
  const [resizing, setResizing] = useState(false)
  const [width, setWidth] = useState(node.attrs.width || '100%')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setWidth(node.attrs.width || '100%')
  }, [node.attrs.width])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!props.editor.isEditable) return;
    
    e.preventDefault()
    setResizing(true)

    const startX = e.clientX
    const startWidth = imgRef.current?.clientWidth || 0
    const parentWidth = imgRef.current?.parentElement?.clientWidth || 1

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX
      const diffX = currentX - startX
      const newWidthPx = startWidth + diffX
      const newWidthPct = Math.max(10, Math.min(100, (newWidthPx / parentWidth) * 100))
      
      setWidth(`${newWidthPct}%`)
    }

    const onMouseUp = () => {
      setResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      
      const rect = imgRef.current?.getBoundingClientRect()
      if (rect && imgRef.current?.parentElement) {
        const pWidth = imgRef.current.parentElement.clientWidth
        const finalPct = (rect.width / pWidth) * 100
        updateAttributes({ width: `${finalPct}%` })
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [updateAttributes, props.editor.isEditable])

  return (
    <NodeViewWrapper 
      className={`inline-block relative group ${selected ? 'outline outline-2 outline-brand-500 rounded-lg' : ''} leading-[0] m-0`}
      style={{ width, maxWidth: '100%' }}
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt}
        title={node.attrs.title}
        style={{ transition: resizing ? 'none' : 'width 0.2s' }}
        className="w-full h-auto block rounded-lg cursor-default shadow-sm m-0"
      />
      
      {/* Resize Handle - Right Edge Area */}
      {props.editor.isEditable && (
        <div 
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 w-4 h-full cursor-col-resize opacity-0 group-hover:opacity-100 flex items-center justify-center translate-x-1/2 z-10"
        >
          <div className="w-1.5 h-12 bg-brand-500 rounded-full shadow-lg border border-white/20" />
        </div>
      )}

      {/* Bottom Right Corner Corner */}
      {props.editor.isEditable && (
        <div 
          onMouseDown={onMouseDown}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 bg-brand-500 rounded-full shadow-lg border border-white/20 translate-x-1/2 translate-y-1/2 z-20"
        />
      )}
    </NodeViewWrapper>
  )
}

export default ResizableImageNode
