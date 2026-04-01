import { useState, useEffect } from 'react'
import { TiptapEditor } from '../features/editor'
import { syncContentImages } from '../features/editor/utils/syncContent'
import {
  CheckCircle2,
  Trash2,
  Plus,
  Target,
  Flag,
  X,
  Activity,
  History,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown
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
  hook?: string
  domain: string
  created_at: string
}

// --- 抽離複用組件 : MissionField ---
const MissionField = ({ icon: Icon, label, content, onChange, defaultCollapsed = false }: { icon: any, label: string, content: string, onChange: (v: string) => void, defaultCollapsed?: boolean }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <section className="animate-in fade-in slide-in-from-bottom duration-700">
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between mb-2 text-gray-500 border-b border-gray-800/40 pb-1 cursor-pointer group hover:text-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className={isCollapsed ? 'text-gray-600' : 'text-brand-500'} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">{label}</h3>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isCollapsed ? '-rotate-90 text-gray-600' : 'rotate-0 text-gray-500'}`} />
      </div>
      {!isCollapsed && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <TiptapEditor content={content} onChange={onChange} />
        </div>
      )}
    </section>
  )
}

// --- Kirby Icon ---
const KirbyIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-[0_0_8px_rgba(255,182,216,0.5)]"
  >
    <circle cx="50" cy="55" r="40" fill="#FFB6D8" stroke="#FF85C0" strokeWidth="2" />
    <ellipse cx="38" cy="45" rx="3" ry="7" fill="#2D2D2D" />
    <ellipse cx="62" cy="45" rx="3" ry="7" fill="#2D2D2D" />
    <ellipse cx="30" cy="55" rx="6" ry="3" fill="#FF85C0" opacity="0.6" />
    <ellipse cx="70" cy="55" rx="6" ry="3" fill="#FF85C0" opacity="0.6" />
    <path d="M 45 65 Q 50 70 55 65" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const Home = () => {
  // --- 介面狀態 ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  // --- Resizing 邏輯 ---
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const stopResizing = () => {
    setIsResizing(false)
  }

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    } else {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  // --- 狀態管理 (Tasks) ---
  const [executions, setExecutions] = useState<Execution[]>([])
  const [activeTask, setActiveTask] = useState<Execution | null>(null)

  const [taskTitle, setTaskTitle] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [executionLog, setExecutionLog] = useState("")
  const [valueDelivered, setValueDelivered] = useState("")
  const [taskStatus, setTaskStatus] = useState("Inprocessing")

  // --- 狀態管理 (Fragments) ---
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [linkedFragments, setLinkedFragments] = useState<Fragment[]>([])

  // 快捷錄入 Modal 狀態
  const [quickLinkTaskId, setQuickLinkTaskId] = useState<string | null>(null)
  const [quickFragmentTitle, setQuickFragmentTitle] = useState("")
  const [quickFragmentDomain, setQuickFragmentDomain] = useState("Work")

  // 主視角切換: Fragment 模式
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [fragmentEditTitle, setFragmentEditTitle] = useState("")
  const [fragmentEditHook, setFragmentEditHook] = useState("")
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("確定要刪除此任務嗎? 這將永久移除工作記錄。")) return
    try {
      const res = await fetch(`http://localhost:8000/api/v1/executions/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        if (activeTask?.id === taskId) setActiveTask(null)
        fetchExecutions()
        setLastSaved(`Mission Expunged @ ${new Date().toLocaleTimeString()}`)
      }
    } catch (err) { console.error("Deletion failed", err) }
  }

  const handleSaveTask = async () => {
    if (!activeTask) return
    try {
      setIsSaving(true)

      // 同步所有編輯器欄位中的圖片
      const syncedProblem = await syncContentImages(problemStatement)
      const syncedLog = await syncContentImages(executionLog)
      const syncedValue = await syncContentImages(valueDelivered)

      // 更新本地狀態以反應同步後的結果
      setProblemStatement(syncedProblem)
      setExecutionLog(syncedLog)
      setValueDelivered(syncedValue)

      const res = await fetch(`http://localhost:8000/api/v1/executions/${activeTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          problem_statement: syncedProblem,
          execution_log: syncedLog,
          value_delivered: syncedValue,
          status: taskStatus
        })
      })
      if (res.ok) {
        setLastSaved(`Mission Synced @ ${new Date().toLocaleTimeString()}`)
        fetchExecutions()
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
      setFragmentEditHook(activeFragment.hook || "")
      setFragmentEditContent(activeFragment.content || "")
    }
  }, [activeFragment])

  const handleDeleteFragment = async (fragmentId: string) => {
    if (!confirm("確定要刪除此知識碎片嗎? 這將永久移除錄入內容。")) return
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ingest/fragment/${fragmentId}`, { method: 'DELETE' })
      if (res.ok) {
        setActiveFragment(null)
        setLastSaved(`Enlightenment Expunged @ ${new Date().toLocaleTimeString()}`)
      }
    } catch (err) { console.error("Deletion failed", err) }
  }

  const handleUpdateFragment = async (newDomain?: string) => {
    if (!activeFragment) return
    try {
      setIsSaving(true)

      // 同步圖片
      const syncedContent = await syncContentImages(fragmentEditContent)
      setFragmentEditContent(syncedContent)

      const res = await fetch(`http://localhost:8000/api/v1/ingest/fragment/${activeFragment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fragmentEditTitle,
          content: syncedContent,
          hook: fragmentEditHook,
          domain: newDomain || activeFragment.domain
        })
      })
      if (res.ok) {
        setLastSaved(`Enlightenment Stored @ ${new Date().toLocaleTimeString()}`)
        // 同步更新本地狀態以便展示正確內容
        setActiveFragment({
          ...activeFragment,
          title: fragmentEditTitle,
          content: syncedContent,
          hook: fragmentEditHook,
          domain: newDomain || activeFragment.domain
        })
      }
    } finally { setIsSaving(false) }
  }

  return (
    <div className={`flex w-full min-h-screen bg-transparent relative overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* 側邊欄切換 */}
      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} className="fixed top-8 left-6 p-2 bg-gray-900 border border-gray-800 rounded-xl text-brand-500 z-50"><PanelLeftOpen size={18} /></button>
      )}

      {/* Sidebar */}
      <aside
        style={{ width: isSidebarOpen ? sidebarWidth : 0 }}
        className={`${isSidebarOpen ? 'border-r border-gray-800/60' : 'opacity-0'} bg-gray-900/10 h-screen transition-[width,opacity] flex flex-col pt-8 pb-12 sticky top-0 overflow-hidden group/sidebar`}
      >
        <div className="px-6 mb-8 flex items-center justify-between font-black uppercase tracking-widest text-gray-500 text-[10px] min-w-[280px]">
          <span className="flex items-center gap-2"><Target size={14} className="text-brand-500" /> Missions</span>
          <div className="flex items-center gap-1">
            <button onClick={handleAddNewTask} className="p-1.5 hover:bg-gray-800 rounded-md text-brand-500"><Plus size={16} /></button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-600"><PanelLeftClose size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 space-y-1 min-w-[280px]">
          {executions.map(ex => (
            <div
              key={ex.id}
              onClick={() => { setActiveTask(ex); setActiveFragment(null); }}
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${activeTask?.id === ex.id ? 'bg-gray-800/60 border-brand-500/40' : 'border-transparent hover:bg-gray-800/40 hover:border-gray-800'}`}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-black truncate ${activeTask?.id === ex.id ? 'text-brand-400' : 'text-gray-400 group-hover:text-gray-200'}`}>{ex.title}</div>
                <div className="mt-2 text-[8px] uppercase tracking-tighter opacity-40">{ex.status}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setQuickLinkTaskId(ex.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-800 text-brand-500 rounded-lg hover:bg-brand-500 hover:text-white transition-all scale-90 border border-gray-700"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(ex.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all scale-90"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-brand-500/30 transition-colors z-10"
        />
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 max-w-5xl mx-auto px-16 pt-8 pb-24 transition-all relative">
        {activeTask ? (
          <div className="animate-in fade-in slide-in-from-bottom duration-500">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-brand-500/10 text-brand-500 rounded-2xl border border-brand-500/20">
                  <KirbyIcon size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Mission</span>
                  <code className="text-[10px] text-gray-700 font-mono italic">{activeTask.id.slice(0, 8)}</code>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="bg-gray-900 border border-gray-800 text-[10px] font-black uppercase text-brand-400 px-4 py-2 rounded-xl focus:outline-none">
                  <option value="To-Do">To-Do</option>
                  <option value="Inprocessing">Inprocessing</option>
                  <option value="Done">Done</option>
                </select>
                <button
                  onClick={() => handleDeleteTask(activeTask.id)}
                  className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-500 hover:border-red-500/40 transition-all active:scale-95 shadow-xl"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={handleSaveTask} disabled={isSaving} className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-brand-600/10 uppercase tracking-widest">SYNC</button>
              </div>
            </header>

            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full text-2xl font-black bg-transparent border-none p-0 focus:outline-none mb-8 caret-brand-500 text-gray-100 placeholder:text-gray-800" placeholder="Task Title..." />

            <div className="space-y-3">
              <MissionField icon={Flag} label="Problem Statement" content={problemStatement} onChange={setProblemStatement} />
              <MissionField icon={Activity} label="Value Delivered" content={valueDelivered} onChange={setValueDelivered} />
              <MissionField icon={History} label="Execution Log" content={executionLog} onChange={setExecutionLog} />

              <div className="pt-5">
                <div className="flex items-center gap-2 mb-4 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] border-b border-gray-800/40 pb-1">
                  <History size={14} className="text-brand-500/50" />
                  Linked Knowledge Graph
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {linkedFragments.length === 0 ? (
                    <div className="col-span-2 py-8 text-center border border-dashed border-gray-800/40 rounded-3xl text-[10px] text-gray-700 italic">
                      No evidence captured or linked for this mission segment.
                    </div>
                  ) : (
                    linkedFragments.map(f => (
                      <div
                        key={f.id}
                        onClick={() => { setActiveFragment(f); setActiveTask(null); }}
                        className="p-4 bg-gray-900/20 border border-gray-800/40 rounded-2xl cursor-pointer hover:border-brand-500/40 transition-all truncate text-xs text-gray-600 italic"
                      >
                        <span className="font-black text-brand-500 mr-2 not-italic uppercase tracking-tighter text-[12px]">{f.title || 'untitled'}</span>
                        {f.content.replace(/<[^>]+>/g, '') || "No content summary"}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeFragment ? (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <header className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
                  title={isSidebarOpen ? "收起側邊欄" : "展開側邊欄"}
                >
                  {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20"><FileText size={20} fill="currentColor" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Knowledge Fragment</span>
                  <code className="text-[10px] text-gray-700 font-mono italic">{activeFragment.id.slice(0, 8)}</code>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={activeFragment.domain}
                  onChange={(e) => handleUpdateFragment(e.target.value)}
                  className="bg-gray-900 border border-gray-800 text-[10px] font-black uppercase text-blue-400 px-4 py-2 rounded-xl focus:outline-none"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Side_Project">Side Project</option>
                  <option value="Uncategorized">Uncategorized</option>
                </select>
                <button onClick={() => setActiveFragment(null)} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest px-4 transition-colors">Discard</button>
                <button
                  onClick={() => handleDeleteFragment(activeFragment.id)}
                  className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-500 hover:border-red-500/40 transition-all active:scale-95 shadow-xl"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => handleUpdateFragment()} disabled={isSaving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-500/10 uppercase tracking-widest transition-all active:scale-[0.98]">Storage</button>
              </div>
            </header>

            <input value={fragmentEditTitle} onChange={(e) => setFragmentEditTitle(e.target.value)} className="w-full text-2xl font-black bg-transparent border-none p-0 focus:outline-none mb-8 caret-blue-500 text-gray-100 placeholder:text-gray-800" placeholder="Point Title..." />

            <div className="space-y-12">
              <MissionField icon={History} label="Hook" content={fragmentEditHook} onChange={setFragmentEditHook} />
              <MissionField icon={FileText} label="Content" content={fragmentEditContent} onChange={setFragmentEditContent} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600 gap-6 opacity-40">
            <Target size={64} className="animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize mission flow to begin capture</div>
          </div>
        )}

        {lastSaved && (
          <div className="fixed bottom-12 right-12 flex items-center gap-3 px-8 py-4 bg-brand-600 text-white rounded-[2rem] shadow-2xl font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-bottom-12 z-[200]">
            <CheckCircle2 size={16} /> {lastSaved}
          </div>
        )}
      </main>

      {/* Quick Ingest Modal */}
      {quickLinkTaskId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl p-10 bg-gray-950 border border-gray-800 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <header className="flex items-center justify-between mb-10">
              <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl"><Plus size={24} /></div>
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
                  className="w-full bg-gray-900 border border-gray-800 p-4 rounded-3xl text-sm font-black text-brand-500 focus:outline-none"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Side_Project">Side Project</option>
                  <option value="Uncategorized">Uncategorized</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] ml-1">Point Title</label>
                <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-[2rem] focus-within:border-brand-500/30 transition-all">
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

            <button onClick={handleQuickAddFragment} disabled={!quickFragmentTitle || isSaving} className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-brand-600/20 transition-all active:scale-[0.98]">ESTABLISH KNOWLEDGE EDGE</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
