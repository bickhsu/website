import { useState, useEffect } from 'react'
import { TiptapEditor } from '../features/editor'
import { 
  Save, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Target, 
  Zap, 
  Flag,
  FileText,
  Activity,
  History,
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
      fetchFragments(activeTask.id) // 只有選中任務時才抓取碎片
    } else {
      setTaskTitle("")
      setProblemStatement("")
      setExecutionLog("")
      setValueDelivered("")
      setTaskStatus("Inprocessing")
      setLinkedFragments([])
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
      } else {
        const errorText = await res.text()
        alert(`建立失敗 (${res.status}): ${errorText}`)
      }
    } catch (err) { 
      alert(`連線到 API 發生錯誤 (可能伺服器沒開): ${err}`)
    }
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
        setLastSaved(`Success: Task Synced @ ${new Date().toLocaleTimeString()}`)
        fetchExecutions()
      }
    } finally { setIsSaving(false) }
  }

  const handleAddFragment = async () => {
    if (!activeTask) return alert("請先選擇或建立一個任務。")
    if (!fragmentContent || fragmentContent === '<p></p>') return alert("請輸入內容。")
    
    try {
      setIsSaving(true)
      const res = await fetch('http://localhost:8000/api/v1/ingest/fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fragmentContent,
          domain: "Task Log",
          linked_execution_id: activeTask.id
        })
      })
      if (res.ok) {
        setFragmentContent('<p></p>')
        setLastSaved(`Fragment Linked @ ${new Date().toLocaleTimeString()}`)
        fetchFragments(activeTask.id) // 存檔後立即更新局部清單
      }
    } finally { setIsSaving(false) }
  }

  return (
    <div className="flex w-full min-h-screen bg-transparent relative">
      {/* 展開側邊欄專用按鈕 (當側邊欄關閉時) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-8 left-6 p-2 bg-gray-900 border border-gray-800 rounded-xl text-emerald-500 hover:text-emerald-400 hover:bg-gray-800 shadow-2xl z-50 transition-all active:scale-95"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* 側邊欄: TASKS */}
      <aside className={`
        ${isSidebarOpen ? 'w-80 border-r border-gray-800/60 opacity-100' : 'w-0 border-none opacity-0'} 
        bg-gray-900/10 flex flex-col pt-8 pb-12 sticky top-0 h-screen transition-all duration-300 ease-in-out overflow-hidden
      `}>
        <div className="px-6 mb-8 flex items-center justify-between font-black uppercase tracking-[0.2em] text-gray-500 text-[11px] whitespace-nowrap">
          <span className="flex items-center gap-2 italic">
            <Target size={14} className="text-emerald-500" /> Tasks
          </span>
          <div className="flex items-center gap-1">
             <button 
              onClick={handleAddNewTask}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-all text-emerald-500 hover:text-emerald-400"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-all text-gray-600 hover:text-white"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 space-y-1">
          {executions.map(ex => (
            <button
              key={ex.id}
              onClick={() => setActiveTask(ex)}
              className={`w-full text-left p-4 rounded-2xl transition-all group border ${activeTask?.id === ex.id ? 'bg-emerald-600/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-transparent border-transparent hover:bg-gray-800/40 hover:border-gray-800/60'}`}
            >
              <div className={`text-xs font-black leading-relaxed tracking-tight break-words ${activeTask?.id === ex.id ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-100'}`}>
                {ex.title}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${ex.status === 'Done' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'}`}>
                  {ex.status}
                </span>
                <span className="text-[10px] text-gray-700 font-mono italic">
                  {new Date(ex.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* 主工作區: Task Detail */}
      <main className="flex-1 max-w-5xl mx-auto px-16 pt-4 pb-24 transition-all duration-300">
        {!activeTask ? (
           <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600 gap-4 opacity-50">
             <Target size={64} className="animate-pulse" />
             <div className="text-xs font-black uppercase tracking-widest">Select a task from sidebar to begin mission</div>
           </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom duration-500">
            <header className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                     <Zap size={20} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Active Task ID</span>
                     <code className="text-[10px] text-gray-700 font-mono">{activeTask.id.slice(0, 8)}...</code>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <select 
                    value={taskStatus} 
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="bg-gray-900 border border-gray-800 text-[11px] font-black uppercase tracking-widest text-emerald-400 px-4 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="To-Do">To-Do</option>
                    <option value="Inprocessing">Inprocessing</option>
                    <option value="Done">Done</option>
                  </select>

                  <button 
                    onClick={handleSaveTask}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black transition-all active:scale-95 disabled:bg-gray-800 shadow-xl shadow-emerald-600/10"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'SYNCING...' : 'SYNC MISSION'}
                  </button>
               </div>
            </header>

            <input 
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-xl font-black bg-transparent border-none p-0 focus:outline-none mb-4 caret-emerald-500 text-gray-100 placeholder:text-gray-800 tracking-tight"
              placeholder="Task Title..."
            />

            <div className="mb-4">
               <section>
                  <div className="flex items-center gap-2 mb-1 text-gray-500 border-b border-gray-800/40 pb-0.5">
                     <Flag size={14} className="text-emerald-500/80" />
                     <h3 className="text-[11px] font-black tracking-[0.15em] text-gray-400 uppercase">Problem Statement</h3>
                  </div>
                  <div className="prose prose-invert">
                    <TiptapEditor content={problemStatement} onChange={setProblemStatement} />
                  </div>
               </section>

               <section>
                  <div className="flex items-center gap-2 mb-1 text-gray-500 border-b border-gray-800/40 pb-0.5">
                     <Activity size={14} className="text-emerald-500/80" />
                     <h3 className="text-[11px] font-black tracking-[0.15em] text-gray-400 uppercase">Value Delivered</h3>
                  </div>
                  <div className="prose prose-invert">
                    <TiptapEditor content={valueDelivered} onChange={setValueDelivered} />
                  </div>
               </section>

               <section className="mt-1">
                  <div className="flex items-center gap-2 mb-1 text-gray-500 border-b border-gray-800/40 pb-0.5">
                     <History size={14} className="text-blue-500/80" />
                     <h3 className="text-[11px] font-black tracking-[0.15em] text-gray-400 uppercase">executionLog</h3>
                  </div>
                  <div className="prose prose-invert">
                    <TiptapEditor content={executionLog} onChange={setExecutionLog} />
                  </div>
               </section>

               {/* Integrated Ingest & Fragments Section */}
               <div className="mt-8 pt-8 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-emerald-400">
                       <FileText size={18} />
                       <h3 className="text-sm font-black uppercase tracking-widest">Fragments // Capture</h3>
                     </div>
                     <button onClick={handleAddFragment} className="px-4 py-1.5 bg-emerald-600 rounded-lg text-[10px] font-black text-white hover:bg-emerald-500 transition-all shadow-lg active:scale-95 disabled:opacity-30">
                       Link Evidence
                     </button>
                  </div>
                  
                  <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-2 mb-8">
                     <TiptapEditor content={fragmentContent} onChange={setFragmentContent} />
                  </div>

                  <div className="px-2">
                     <div className="flex items-center gap-2 text-gray-600 mb-4 opacity-70">
                        <History size={14} />
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Linked History</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-3 text-xs italic text-gray-700">
                        {linkedFragments.length === 0 ? (
                          <div className="col-span-2 py-4 text-center border border-dashed border-gray-800/40 rounded-xl text-[10px]">
                            No evidence captured for this mission segment.
                          </div>
                        ) : (
                          linkedFragments.slice(0, 4).map(f => (
                            <div key={f.id} className="p-3 rounded-xl bg-gray-900/20 border border-gray-800/40 font-mono truncate">
                               {f.content.replace(/<[^>]+>/g, '') || "(Empty content)"}
                            </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Feedback Toast */}
            {lastSaved && (
              <div className="fixed bottom-10 right-10 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest animate-in slide-in-from-bottom-10">
                <CheckCircle2 size={16} /> {lastSaved}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
