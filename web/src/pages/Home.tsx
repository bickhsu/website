import { useState, useEffect } from 'react'
import { TiptapEditor } from '../features/editor'
import { 
  CheckCircle2, 
  Plus, 
  Target, 
  Zap, 
  Flag,
  X,
  Activity,
  History,
  FileText,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

// 定義介面
interface Execution {
  id: string
  title: string
  problem_statement: string
  status: string
  value_delivered?: string
  execution_log?: string
  created_at: string
}

interface Fragment {
  id: string
  title: string
  content: string
  domain: string
  created_at: string
}

const Home = () => {
  // --- 介面狀態 ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // --- 狀態管理 (Tasks) ---
  const [executions, setExecutions] = useState<Execution[]>([])
  const [activeTask, setActiveTask] = useState<Execution | null>(null)
  
  const [taskTitle, setTaskTitle] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [executionLog, setExecutionLog] = useState("")
  const [valueDelivered, setValueDelivered] = useState("")
  const [taskStatus, setTaskStatus] = useState("Inprocessing")
  
  // --- 狀態管理 (Fragments) ---
  const [fragmentContent, setFragmentContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [linkedFragments, setLinkedFragments] = useState<Fragment[]>([])
  const [fragmentDomain, setFragmentDomain] = useState("Work")
  
  // 快捷錄入 Modal 狀態
  const [quickLinkTaskId, setQuickLinkTaskId] = useState<string | null>(null)
  const [quickFragmentTitle, setQuickFragmentTitle] = useState("")
  const [quickFragmentDomain, setQuickFragmentDomain] = useState("Work")

  // 主視角切換: Fragment 模式
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [fragmentEditTitle, setFragmentEditTitle] = useState("")
  const [fragmentEditContent, setFragmentEditContent] = useState("")

  // --- 資料抓取 ---
  useEffect(() => {
    fetchExecutions()
  }, [])

  // 當選中 Tasks 時同步編輯器內容並抓取關聯 Fragment
  useEffect(() => {
    if (activeTask) {
      setTaskTitle(activeTask.title || "Untitled Mission")
      setProblemStatement(activeTask.problem_statement || "")
      setExecutionLog(activeTask.execution_log || "")
      setValueDelivered(activeTask.value_delivered || "")
      setTaskStatus(activeTask.status || "Inprocessing")
      fetchFragments(activeTask.id)
    }
  }, [activeTask])

  const fetchExecutions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/executions/')
      if (res.ok) setExecutions(await res.json())
    } catch (err) { console.error("Failed to fetch executions", err) }
  }

  const fetchFragments = async (executionId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/executions/${executionId}/fragments`)
      if (res.ok) setLinkedFragments(await res.json())
    } catch (err) { console.error("Failed to fetch fragments", err) }
  }

  // --- 功能邏輯 : Tasks ---
  const handleAddNewTask = async () => {
    const title = prompt("請輸入新任務標題:")
    if (!title) return
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/executions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title, 
          problem_statement: "<p>What problem are we solving?</p>", 
          status: 'Inprocessing' 
        })
      })
      if (res.ok) {
        const newTask = await res.json()
        setExecutions([newTask, ...executions])
        setActiveTask(newTask)
      }
    } catch (err) { console.error(err) }
  }

  const handleSaveTask = async () => {
    if (!activeTask) return
    try {
      setIsSaving(true)
      const res = await fetch(`http://localhost:8000/api/v1/executions/${activeTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          problem_statement: problemStatement,
          execution_log: executionLog,
          value_delivered: valueDelivered,
          status: taskStatus
        })
      })
      if (res.ok) {
        setLastSaved(`Mission Synced @ ${new Date().toLocaleTimeString()}`)
        fetchExecutions()
      }
    } finally { setIsSaving(false) }
  }

  const handleAddFragment = async () => {
    if (!activeTask) return
    if (!fragmentContent || fragmentContent === '<p></p>') return
    
    try {
      setIsSaving(true)
      const res = await fetch('http://localhost:8000/api/v1/ingest/fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Quick Evidence",
          content: fragmentContent,
          domain: fragmentDomain,
          linked_execution_id: activeTask.id
        })
      })
      if (res.ok) {
        setFragmentContent('<p></p>')
        setLastSaved(`Knowledge Indexed @ ${new Date().toLocaleTimeString()}`)
        fetchFragments(activeTask.id)
      }
    } finally { setIsSaving(false) }
  }

  const handleQuickAddFragment = async () => {
    if (!quickLinkTaskId || !quickFragmentTitle) return
    
    try {
      setIsSaving(true)
      const res = await fetch('http://localhost:8000/api/v1/ingest/fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickFragmentTitle,
          content: "<p>Initial fragment content...</p>",
          domain: quickFragmentDomain,
          linked_execution_id: quickLinkTaskId
        })
      })
      if (res.ok) {
        const newFrag = await res.json()
        setQuickFragmentTitle('')
        setQuickLinkTaskId(null)
        setActiveTask(null)
        setActiveFragment(newFrag)
      }
    } finally { setIsSaving(false) }
  }

  // 當開啟 Fragment 編輯時同步狀態
  useEffect(() => {
    if (activeFragment) {
      setFragmentEditTitle(activeFragment.title || "Untitled Fragment")
      setFragmentEditContent(activeFragment.content || "")
    }
  }, [activeFragment])

  const handleUpdateFragment = async () => {
    if (!activeFragment) return
    try {
      setIsSaving(true)
      const res = await fetch(`http://localhost:8000/api/v1/ingest/fragment/${activeFragment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fragmentEditTitle,
          content: fragmentEditContent,
          domain: activeFragment.domain
        })
      })
      if (res.ok) {
        setLastSaved(`Enlightenment Stored @ ${new Date().toLocaleTimeString()}`)
      }
    } finally { setIsSaving(false) }
  }

  return (
    <div className="flex w-full min-h-screen bg-transparent relative overflow-hidden">
      {/* 側邊欄切換 */}
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} className="fixed top-8 left-6 p-2 bg-gray-900 border border-gray-800 rounded-xl text-emerald-500 z-50"><PanelLeftOpen size={18} /></button>
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80 border-r border-gray-800/60' : 'w-0 opacity-0'} bg-gray-900/10 h-screen transition-all flex flex-col pt-8 pb-12 sticky top-0 overflow-hidden`}>
        <div className="px-6 mb-8 flex items-center justify-between font-black uppercase tracking-widest text-gray-500 text-[10px]">
          <span className="flex items-center gap-2"><Target size={14} className="text-emerald-500" /> Missions</span>
          <div className="flex items-center gap-1">
            <button onClick={handleAddNewTask} className="p-1.5 hover:bg-gray-800 rounded-md text-emerald-500"><Plus size={16} /></button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-600"><PanelLeftClose size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 space-y-1">
          {executions.map(ex => (
            <div 
              key={ex.id} 
              onClick={() => { setActiveTask(ex); setActiveFragment(null); }}
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${activeTask?.id === ex.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'border-transparent hover:bg-gray-800/40 hover:border-gray-800'}`}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-black truncate ${activeTask?.id === ex.id ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-200'}`}>{ex.title}</div>
                <div className="mt-2 text-[8px] uppercase tracking-tighter opacity-40">{ex.status}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setQuickLinkTaskId(ex.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all scale-90"
              >
                <Plus size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 max-w-5xl mx-auto px-16 pt-8 pb-24 transition-all relative">
        {activeTask ? (
          <div className="animate-in fade-in slide-in-from-bottom duration-500">
             <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20"><Zap size={20} fill="currentColor" /></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Mission</span>
                      <code className="text-[10px] text-gray-700 font-mono italic">{activeTask.id.slice(0, 8)}</code>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="bg-gray-900 border border-gray-800 text-[10px] font-black uppercase text-emerald-400 px-4 py-2 rounded-xl focus:outline-none">
                      <option value="To-Do">To-Do</option>
                      <option value="Inprocessing">Inprocessing</option>
                      <option value="Done">Done</option>
                   </select>
                   <button onClick={handleSaveTask} disabled={isSaving} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/10 uppercase tracking-widest">SYNC</button>
                </div>
             </header>

             <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full text-2xl font-black bg-transparent border-none p-0 focus:outline-none mb-8 caret-emerald-500 text-gray-100 placeholder:text-gray-800" placeholder="Task Title..." />

             <div className="space-y-6">
                <section>
                   <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800/40 pb-1"><Flag size={14} /><h3 className="text-[10px] font-black uppercase tracking-widest">Problem Statement</h3></div>
                   <TiptapEditor content={problemStatement} onChange={setProblemStatement} />
                </section>
                <section>
                   <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800/40 pb-1"><Activity size={14} /><h3 className="text-[10px] font-black uppercase tracking-widest">Value Delivered</h3></div>
                   <TiptapEditor content={valueDelivered} onChange={setValueDelivered} />
                </section>
                <section>
                   <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800/40 pb-1"><History size={14} /><h3 className="text-[10px] font-black uppercase tracking-widest">Execution Log</h3></div>
                   <TiptapEditor content={executionLog} onChange={setExecutionLog} />
                </section>

                <div className="mt-16 pt-8 border-t border-gray-800">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500/80">Segment Ingestion</h3>
                        <select 
                          value={fragmentDomain} 
                          onChange={(e) => setFragmentDomain(e.target.value)}
                          className="bg-gray-800 border border-gray-800 text-[10px] font-black uppercase px-2 py-1 rounded-lg text-emerald-500/60 focus:outline-none"
                        >
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Side_Project">Side Project</option>
                          <option value="Uncategorized">Uncategorized</option>
                        </select>
                      </div>
                      <button onClick={handleAddFragment} className="px-6 py-2 bg-emerald-600 text-[10px] font-black text-white rounded-xl shadow-lg shadow-emerald-500/10">LINK FRAGMENT</button>
                   </div>
                   <div className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 mb-12"><TiptapEditor content={fragmentContent} onChange={setFragmentContent} /></div>
                   <div className="grid grid-cols-2 gap-4">
                      {linkedFragments.map(f => (
                        <div key={f.id} onClick={() => { setActiveFragment(f); setActiveTask(null); }} className="p-4 bg-gray-900/20 border border-gray-800/40 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all truncate text-xs text-gray-600 italic">
                          <span className="font-black text-emerald-500 mr-2 not-italic uppercase tracking-tighter text-[9px]">{f.title || 'untitled'}</span>
                          {f.content.replace(/<[^>]+>/g, '') || "No content summary"}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        ) : activeFragment ? (
          <div className="animate-in fade-in slide-in-from-right duration-500">
             <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20"><FileText size={20} fill="currentColor" /></div>
                   <h3 className="text-lg font-black text-gray-100 uppercase tracking-widest leading-none">Knowledge Forge</h3>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={() => setActiveFragment(null)} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest">Discard Edit</button>
                   <button onClick={handleUpdateFragment} disabled={isSaving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-500/10 tracking-widest">STORE ENLIGHTENMENT</button>
                </div>
             </header>
             <input value={fragmentEditTitle} onChange={(e) => setFragmentEditTitle(e.target.value)} className="w-full text-3xl font-black bg-transparent border-none p-0 focus:outline-none mb-12 caret-blue-500 text-gray-100" placeholder="Concept Title..." />
             <div className="p-10 bg-gray-900/40 border border-gray-800 rounded-[3rem] min-h-[60vh] shadow-inner"><TiptapEditor content={fragmentEditContent} onChange={setFragmentEditContent} /></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600 gap-6 opacity-40">
             <Target size={64} className="animate-pulse" />
             <div className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize mission flow to begin capture</div>
          </div>
        )}

        {lastSaved && (
          <div className="fixed bottom-12 right-12 flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[2rem] shadow-2xl font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-bottom-12 z-[200]">
            <CheckCircle2 size={16} /> {lastSaved}
          </div>
        )}
      </main>

      {/* Quick Ingest Modal */}
      {quickLinkTaskId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-xl p-10 bg-gray-950 border border-gray-800 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
              <header className="flex items-center justify-between mb-10">
                 <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Plus size={24} /></div>
                 <button onClick={() => setQuickLinkTaskId(null)} className="p-2 text-gray-600 hover:text-white transition-all"><X size={20} /></button>
              </header>
              <h3 className="text-xl font-black text-gray-100 uppercase tracking-widest mb-2">Rapid Enlightenment</h3>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-8 italic">Linking to: {executions.find(e => e.id === quickLinkTaskId)?.title}</p>
              
              <div className="flex flex-col gap-6 mb-10">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] ml-1">Select Domain</label>
                    <select 
                      value={quickFragmentDomain} 
                      onChange={(e) => setQuickFragmentDomain(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 p-4 rounded-3xl text-sm font-black text-emerald-500 focus:outline-none"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Side_Project">Side Project</option>
                      <option value="Uncategorized">Uncategorized</option>
                    </select>
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] ml-1">Point Title</label>
                    <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-[2rem] focus-within:border-emerald-500/30 transition-all">
                       <input 
                          value={quickFragmentTitle} 
                          onChange={(e) => setQuickFragmentTitle(e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none text-white text-lg font-black placeholder:text-gray-800"
                          placeholder="Fragment Title..."
                          autoFocus
                       />
                    </div>
                 </div>
              </div>

              <button onClick={handleQuickAddFragment} disabled={!quickFragmentTitle || isSaving} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-emerald-600/20 transition-all active:scale-[0.98]">ESTABLISH KNOWLEDGE EDGE</button>
           </div>
        </div>
      )}
    </div>
  )
}

export default Home
