import { useState, useEffect } from 'react'
import { TiptapEditor } from '../features/editor'
import { Save, CheckCircle2, History, Loader2, Plus, Trash2, Target, Zap } from 'lucide-react'

// 定義介面
interface Execution {
  id: string
  problem_statement: string
  status: string
  created_at: string
}

interface Fragment {
  id: string
  content: string
  domain: string
  created_at: string
}

const Home = () => {
  // --- 狀態管理 ---
  const [executions, setExecutions] = useState<Execution[]>([])
  const [activeTask, setActiveTask] = useState<Execution | null>(null)
  
  const [activeId, setActiveId] = useState<string | null>(null) // 追蹤目前編輯的文章 ID
  const [title, setTitle] = useState("Exploring Knowledge")
  const [content, setContent] = useState("<p>Knowledge capture in progress...</p>")
  const [domain, setDomain] = useState("Uncategorized")
  
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  
  const [recents, setRecents] = useState<Fragment[]>([])
  const [isLoadingRecents, setIsLoadingRecents] = useState(false)

  // --- 資料抓取 ---
  useEffect(() => {
    fetchExecutions()
    fetchFragments()
  }, [])

  const fetchExecutions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/executions/')
      if (res.ok) setExecutions(await res.json())
    } catch (err) { console.error("Failed to fetch executions", err) }
  }

  const fetchFragments = async () => {
    try {
      setIsLoadingRecents(true)
      const res = await fetch('http://localhost:8000/fragments')
      if (res.ok) {
        const data = await res.json()
        setRecents(data.slice(0, 10)) // 顯示稍多一點
      }
    } catch (err) { console.error("Failed to fetch fragments", err) } finally {
      setIsLoadingRecents(false)
    }
  }

  // --- 功能邏輯 ---
  const handleAddNewTask = async () => {
    const promptValue = prompt("請輸入任務目標 (Problem Statement):")
    if (!promptValue) return
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/executions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_statement: promptValue, status: 'Doing' })
      })
      if (res.ok) {
        const newTask = await res.json()
        setExecutions([newTask, ...executions])
        setActiveTask(newTask)
      }
    } catch (err) { console.error(err) }
  }

  const handleNew = () => {
    setActiveId(null)
    setTitle("New Fragment")
    setContent("<p>Capture fresh knowledge...</p>")
    setDomain("Uncategorized")
    setLastSaved(null)
  }

  const handleDelete = async () => {
    if (!activeId || !confirm("確定要刪除這篇 fragment 嗎？")) return
    try {
      setIsSaving(true)
      const res = await fetch(`http://localhost:8000/api/v1/ingest/fragment/${activeId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        handleNew()
        fetchFragments()
      }
    } finally { setIsSaving(false) }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const url = activeId ? `http://localhost:8000/api/v1/ingest/fragment/${activeId}` : 'http://localhost:8000/api/v1/ingest/fragment'
      const method = activeId ? 'PATCH' : 'POST'
      
      const payload = {
        content: `<h1>${title}</h1>\n${content}`,
        domain: domain,
        // 如果是新增 Fragment，則自動串接當前任務內容
        linked_execution_id: activeId ? undefined : activeTask?.id
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString())
        fetchFragments()
      }
    } finally { setIsSaving(false) }
  }

  const loadFragment = (f: Fragment) => {
    setActiveId(f.id)
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
    <div className="flex w-full min-h-screen bg-transparent">
      {/* 任務側邊欄 */}
      <aside className="w-80 border-r border-gray-800/60 bg-gray-900/10 flex flex-col pt-8 pb-12 sticky top-0 h-screen">
        <div className="px-6 mb-8 flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
            <Target size={14} className="text-blue-500" /> Current Missions
          </h2>
          <button 
            onClick={handleAddNewTask}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors text-gray-500 hover:text-white"
            title="Start New Task"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4 space-y-1">
          {executions.map(ex => (
            <button
              key={ex.id}
              onClick={() => setActiveTask(ex)}
              className={`w-full text-left p-3.5 rounded-2xl transition-all group border ${activeTask?.id === ex.id ? 'bg-blue-600/5 border-blue-500/40 shadow-lg shadow-blue-500/5' : 'bg-transparent border-transparent hover:bg-gray-800/30'}`}
            >
              <div className={`text-xs font-bold leading-relaxed ${activeTask?.id === ex.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {ex.problem_statement}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${activeTask?.id === ex.id ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>
                  {ex.status}
                </span>
                <span className="text-[9px] text-gray-600 font-mono italic">
                  {new Date(ex.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* 編輯主區域 */}
      <main className="flex-1 max-w-5xl mx-auto px-12 pt-8 font-sans pb-40">
        {/* 操作與狀態列 */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {activeTask && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[10px] font-black text-blue-400/90 uppercase tracking-widest animate-in slide-in-from-left duration-300">
                <Zap size={14} className="fill-blue-500/30" /> Mission Active: {activeTask.problem_statement.slice(0, 30)}...
                <button onClick={() => setActiveTask(null)} className="ml-2 hover:text-white">✕</button>
              </div>
            )}
            {activeId && (
              <button onClick={handleNew} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 border border-transparent hover:border-gray-700">
                <Plus size={14} /> New Fragment
              </button>
            )}
            {!activeTask && !activeId && (
               <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Select a mission to link fragments</div>
            )}
          </div>

          <div className="flex items-center gap-3">
             {lastSaved && (
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <CheckCircle2 size={12} /> Sync: {lastSaved}
                </span>
              )}
            <div className="flex items-center gap-2">
              {activeId && (
                <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-sm font-bold transition-all ${isSaving ? 'bg-gray-800 text-gray-500' : activeId ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10'} active:scale-95`}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Synching...' : (activeId ? 'Update Fragment' : 'Publish to Mission')}
              </button>
            </div>
          </div>
        </div>

        {/* 編輯核心 */}
        <section className="space-y-4 mb-20">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-black bg-transparent text-gray-100 placeholder:text-gray-800 focus:outline-none caret-blue-500 p-0 border-none"
            placeholder="Fragment Title..."
          />
          <div className="min-h-[400px] prose prose-invert">
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </section>

        {/* 歷史列表 */}
        <footer className="pt-12 border-t border-gray-800/50">
          <div className="flex items-center gap-2 mb-8 text-gray-500">
            <History size={16} />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Recent Fragments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {isLoadingRecents ? (
              <div className="text-sm text-gray-600 font-mono italic">Fetching subgraph...</div>
            ) : recents.length > 0 ? (
              recents.map(f => (
                <button
                  key={f.id}
                  onClick={() => loadFragment(f)}
                  className={`p-5 rounded-2xl text-left transition-all border ${activeId === f.id ? 'bg-blue-900/10 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-gray-900/40 border-gray-800/50 hover:border-gray-700'}`}
                >
                  <div className="text-sky-400 text-[10px] font-mono mb-1.5 uppercase tracking-widest font-bold">Fragment</div>
                  <div className="text-sm text-gray-300 font-bold truncate group-hover:text-white leading-relaxed">
                    {f.content.replace(/<[^>]+>/g, '').slice(0, 60) || "(Empty)"}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-[10px] text-gray-600 font-mono">{new Date(f.created_at).toLocaleDateString()}</div>
                    <div className={`text-[9px] font-mono ${activeId === f.id ? 'text-blue-400' : 'text-gray-700'}`}>
                      {activeId === f.id ? 'FOCUSING' : 'LOAD'}
                    </div>
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
      </main>
    </div>
  )
}

export default Home
