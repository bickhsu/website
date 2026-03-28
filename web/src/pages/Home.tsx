import { useState } from 'react'
import { TiptapEditor } from '../features/editor'
import { Plus, Search, Notebook, Trash2, Save, MoreVertical, Settings } from 'lucide-react'
const Home = () => {
  const [title, setTitle] = useState("Understanding FBA & Moat")
  const [content, setContent] = useState("<p>Starting my knowledge graph here...</p>")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('http://localhost:8000/api/v1/ingest/fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 這裡將標題與內容合併送入 content 欄位，未來也可以擴充 Fragment 加上 title 欄位
          content: `<h1>${title}</h1>\n${content}`,
          domain: 'Uncategorized'
        })
      })

      if (res.ok) {
        console.log("Fragment ingested!")
        // You could trigger a toast notification here
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
    <div className="flex h-[calc(100vh-40px)] w-full gap-6 max-w-7xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-gray-900/40">
      {/* Sidebar - Features/Navigation */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900/60 p-4 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Notebook size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-100">Bick Notes</h1>
        </div>

        <button className="flex items-center gap-2 w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm">
          <Plus size={16} /> New Note
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-300"
          />
        </div>

        <nav className="flex-1 overflow-auto space-y-1">
          <h2 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 tracking-wider">Recents</h2>
          {[
            "Vite + React Setup",
            "FastAPI Integration Plan",
            "Tiptap Features List",
            "Tailwind v4 Design System",
          ].map((note, i) => (
            <button key={i} className="flex items-center gap-2 w-full p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors text-sm text-left truncate">
              <Notebook size={14} className="flex-shrink-0" /> {note}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-gray-800 flex items-center justify-between px-1">
          <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
          <span className="text-xs text-gray-600 font-mono">v0.1.0</span>
        </div>
      </aside>

      {/* Main Content - Editor Area */}
      <main className="flex-1 flex flex-col p-8 min-w-0 bg-transparent">
        {/* Note Controls / Toolbar Header */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
            <span>Last Edited: Just now</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>431 words</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all border border-transparent hover:border-red-900/30">
              <Trash2 size={18} />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-white active:scale-95'} text-gray-900 rounded-lg transition-all font-bold text-sm shadow-sm`}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* Note Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-extrabold bg-transparent text-gray-100 placeholder:text-gray-700 focus:outline-none mb-6 caret-blue-500 w-full"
          placeholder="Note Title..."
        />

        {/* Tiptap Editor */}
        <div className="flex-1 overflow-auto rounded-xl">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </main>
    </div>
  )
}

export default Home
