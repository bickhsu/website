import { useState, useEffect } from 'react'
import { TiptapEditor } from '../features/editor'
import { Save, CheckCircle2, History, Loader2 } from 'lucide-react'

// 定義簡單的 Fragment 介面
interface Fragment {
  id: string
  content: string
  domain: string
  created_at: string
}

const Home = () => {
  const [title, setTitle] = useState("Exploring Knowledge Fragments")
  const [content, setContent] = useState("<p>Start typing your fragment here...</p>")
  const [domain, setDomain] = useState("Uncategorized")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  
  // MVP: 最近的文章清單
  const [recents, setRecents] = useState<Fragment[]>([])
  const [isLoadingRecents, setIsLoadingRecents] = useState(false)

  const fetchFragments = async () => {
    try {
      setIsLoadingRecents(true)
      const res = await fetch('http://localhost:8000/fragments')
      if (res.ok) {
        const data = await res.json()
        setRecents(data.slice(0, 5)) // 只拿最新 5 筆
      }
    } catch (err) {
      console.error("Failed to fetch fragments", err)
    } finally {
      setIsLoadingRecents(false)
    }
  }

  useEffect(() => {
    fetchFragments()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('http://localhost:8000/api/v1/ingest/fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 這裡將標題與內容合併送入 content 欄位
          content: `<h1>${title}</h1>\n${content}`,
          domain: domain
        })
      })

      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString())
        fetchFragments() // 儲存後更新清單
      } else {
        console.error("Failed to save", await res.text())
      }
    } catch (error) {
      console.error("API Error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // 載入特定的 Fragment
  const loadFragment = (f: Fragment) => {
    // 試著解析 title (若 content 以 <h1> 開頭)
    const titleMatch = f.content.match(/<h1>(.*?)<\/h1>/)
    if (titleMatch) {
      setTitle(titleMatch[1])
      setContent(f.content.replace(titleMatch[0], '').trim())
    } else {
      setContent(f.content)
      setTitle("Untitled Fragment")
    }
    setDomain(f.domain)
  }

  return (
    <div className="max-w-4xl mx-auto w-full pt-12 animate-in fade-in duration-700 font-sans">
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
            <span className="flex items-center gap-1.5 text-xs text-green-500/80 font-medium font-mono uppercase">
              <CheckCircle2 size={12} /> Sync @ {lastSaved}
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
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Processing...' : 'Publish'}
        </button>
      </div>

      {/* 編輯區 */}
      <main className="space-y-8 min-h-[50vh]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-5xl font-black bg-transparent text-gray-100 placeholder:text-gray-800 focus:outline-none caret-blue-500 border-none p-0"
          placeholder="New Knowledge title..."
        />

        <div className="min-h-[400px] prose prose-invert">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </main>

      {/* MVP 歷史列表 */}
      <footer className="mt-20 pt-12 border-t border-gray-800/50 pb-32">
        <div className="flex items-center gap-2 mb-8 text-gray-500">
          <History size={16} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Recently Ingested</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingRecents && recents.length === 0 ? (
            <div className="text-sm text-gray-600 font-mono italic">Fetching graph data...</div>
          ) : recents.length > 0 ? (
            recents.map(f => (
              <button
                key={f.id}
                onClick={() => loadFragment(f)}
                className="p-5 bg-gray-900/40 border border-gray-800/50 rounded-2xl text-left hover:border-gray-700 hover:bg-gray-800/40 transition-all group scale-100 active:scale-98"
              >
                <div className="text-sky-400 text-[10px] font-mono mb-1.5 uppercase tracking-widest font-bold">{f.domain}</div>
                <div className="text-sm text-gray-300 font-bold truncate group-hover:text-white transition-colors leading-relaxed">
                  {f.content.replace(/<[^>]+>/g, '').slice(0, 60) || "(Empty content)"}
                </div>
                <div className="flex items-center justify-between mt-4">
                   <div className="text-[10px] text-gray-600 font-mono">
                    {new Date(f.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-[9px] text-gray-700 font-mono group-hover:text-gray-500">LOAD FRAGMENT</div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 p-8 border border-dashed border-gray-800 rounded-2xl text-center text-gray-600 text-sm">
              No fragments found in the graph. Create one to start.
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}

export default Home


