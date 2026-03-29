import { useState } from 'react'
import { TiptapEditor } from '../features/editor'
import { Save, CheckCircle2 } from 'lucide-react'

const Home = () => {
  const [title, setTitle] = useState("Exploring Knowledge Fragments")
  const [content, setContent] = useState("<p>Start typing your fragment here...</p>")
  const [domain, setDomain] = useState("Uncategorized")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('http://localhost:8000/api/v1/ingest/fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 這裡將標題與內容合併送入 content 欄位，未來也可以擴充 Fragment 加上 title 欄位
          content: `<h1>${title}</h1>\n${content}`,
          domain: domain
        })
      })

      if (res.ok) {
        console.log("Fragment ingested!")
        setLastSaved(new Date().toLocaleTimeString())
      } else {
        console.error("Failed to save", await res.text())
      }
    } catch (error) {
      console.error("API Error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full pt-12 animate-in fade-in duration-700">
      {/* 操作區：固定在頂部 */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="text-xs font-mono uppercase tracking-widest bg-gray-900 text-gray-400 px-3 py-1.5 rounded-full border border-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Domain..."
          />
          {lastSaved && (
            <span className="flex items-center gap-1.5 text-xs text-green-500/80 font-medium">
              <CheckCircle2 size={14} /> Saved at {lastSaved}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2.5 px-6 py-2 rounded-xl text-sm font-bold transition-all
            ${isSaving 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
            }
          `}
        >
          <Save size={16} />
          {isSaving ? 'Processing...' : 'Sync to Backend'}
        </button>
      </div>

      {/* 編輯區 */}
      <main className="space-y-8 pb-32">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-5xl font-black bg-transparent text-gray-100 placeholder:text-gray-800 focus:outline-none caret-blue-500 border-none p-0"
          placeholder="New Knowledge title..."
        />

        <div className="min-h-[500px] prose prose-invert">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </main>
    </div>
  )
}

export default Home

