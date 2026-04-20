import { TiptapEditor } from '../features/editor'
import { syncContentImages } from '../features/editor/utils/syncContent'
import { API_BASE_URL, ENDPOINTS } from '../config/api'
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

// Define Interface
interface Frame {
  id: string
  content: string
  createdAt: string
}

interface SequenceFrame {
  addedAt: string
  frame: Frame
}

interface Keyframe {
  id: string
  title: string
  content: string
  hook?: string
  domain: string
  createdAt: string
}

interface SequenceKeyframe {
  addedAt: string
  keyframe: Keyframe
}

interface Sequence {
  id: string
  title: string
  problemStatement: string
  status: string
  valueDelivered?: string
  domain: string
  createdAt: string
  sequenceFrames: SequenceFrame[]
  sequenceKeyframes: SequenceKeyframe[]
}

// --- 抽離複用組件 : MissionField ---
const MissionField = ({ icon: Icon, label, content, onChange, activeColorClass = 'text-brand-500', defaultCollapsed = false }: { icon: any, label: string, content: string, onChange: (v: string) => void, activeColorClass?: string, defaultCollapsed?: boolean }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <section className="animate-in fade-in slide-in-from-bottom duration-700">
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between mb-2 text-gray-500 border-b border-gray-800/40 pb-1 cursor-pointer group hover:text-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className={isCollapsed ? 'text-gray-600' : activeColorClass} />
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

// --- 抽離複用組件 : SidebarTabButton ---
const SidebarTabButton = ({ active, onClick, icon: Icon, label, colorClass }: { active: boolean, onClick: () => void, icon: any, label: string, colorClass: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pb-2 transition-all border-b-2 ${active ? `${colorClass} border-current` : 'border-transparent text-gray-600 hover:text-gray-400'}`}
  >
    <Icon size={14} /> {label}
  </button>
)

// --- 抽離複用組件 : SidebarItem ---
const SidebarItem = ({
  active,
  onClick,
  title,
  subtitle,
  activeColorClass,
  onDelete,
  onQuickAction,
  quickActionIcon: QuickActionIcon
}: {
  active: boolean,
  onClick: () => void,
  title: string,
  subtitle: string,
  activeColorClass: string,
  onDelete?: (e: React.MouseEvent) => void,
  onQuickAction?: (e: React.MouseEvent) => void,
  quickActionIcon?: any
}) => (
  <div
    onClick={onClick}
    className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${active ? `bg-gray-800/60 ${activeColorClass.replace('text-', 'border-').replace('500', '400')}/40` : 'border-transparent hover:bg-gray-800/40 hover:border-gray-800'}`}
  >
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-black truncate ${active ? activeColorClass : 'text-gray-400 group-hover:text-gray-200'}`}>{title}</div>
      <div className="mt-2 text-[8px] uppercase tracking-tighter opacity-40">{subtitle}</div>
    </div>
    <div className="flex items-center gap-1">
      {onQuickAction && QuickActionIcon && (
        <button
          onClick={onQuickAction}
          className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-800 text-knowledge-500 rounded-lg hover:bg-knowledge-500 hover:text-white transition-all scale-90 border border-gray-700"
        >
          <QuickActionIcon size={12} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all scale-90"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  </div>
)

// --- 抽離複用組件 : ViewHeader ---
const ViewHeader = ({
  icon: Icon,
  title,
  id,
  colorClass,
  children
}: {
  icon: any,
  title: string,
  id: string,
  colorClass: string,
  children: React.ReactNode
}) => (
  <header className="flex items-center justify-between mb-12 animate-in fade-in duration-700">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${colorClass.replace('text-', 'bg-').replace('500', '500/10')} ${colorClass} rounded-2xl border ${colorClass.replace('text-', 'border-').replace('500', '500/20')}`}>
        <Icon size={20} fill={Icon === KirbyIcon ? 'none' : 'currentColor'} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{title}</span>
        <code className="text-[10px] text-gray-700 font-mono italic">{id.slice(0, 8)}</code>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {children}
    </div>
  </header>
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

  // --- State Management (Sequences) ---
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [activeTask, setActiveTask] = useState<Sequence | null>(null)

  const [taskTitle, setTaskTitle] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [valueDelivered, setValueDelivered] = useState("")
  const [taskStatus, setTaskStatus] = useState("Inprocessing")

  // --- 狀態管理 (Message Board) ---
  const [newFrameContent, setNewFrameContent] = useState("")

  // --- State Management (Keyframes) ---
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [linkedKeyframes, setLinkedKeyframes] = useState<SequenceKeyframe[]>([])

  // Quick Link Modal State
  const [quickLinkTaskId, setQuickLinkTaskId] = useState<string | null>(null)
  const [quickFragmentTitle, setQuickFragmentTitle] = useState("")
  const [quickFragmentDomain, setQuickFragmentDomain] = useState("Work")

  // Main View Toggle: Fragment Mode
  const [activeKeyframe, setActiveKeyframe] = useState<Keyframe | null>(null)
  const [allKeyframes, setAllKeyframes] = useState<Keyframe[]>([])
  const [sidebarTab, setSidebarTab] = useState<'tasks' | 'fragments'>('tasks')
  const [fragmentEditTitle, setFragmentEditTitle] = useState("")
  const [fragmentEditHook, setFragmentEditHook] = useState("")
  const [fragmentEditContent, setFragmentEditContent] = useState("")

  // --- 資料抓取 ---
  useEffect(() => {
    fetchSequences()
    fetchAllKeyframes()
  }, [])

  // 當選中 Tasks 時同步編輯器內容並抓取詳情
  useEffect(() => {
    if (activeTask) {
      setTaskTitle(activeTask.title || "Untitled Mission")
      setProblemStatement(activeTask.problemStatement || "")
      setValueDelivered(activeTask.valueDelivered || "")
      setTaskStatus(activeTask.status || "Inprocessing")
      fetchSequenceDetail(activeTask.id)
    }
  }, [activeTask])

  const fetchSequences = async () => {
    try {
      const res = await fetch(ENDPOINTS.SEQUENCES)
      if (res.ok) setSequences(await res.json())
    } catch (err) { console.error("Failed to fetch sequences", err) }
  }

  const fetchSequenceDetail = async (id: string) => {
    try {
      const res = await fetch(`${ENDPOINTS.SEQUENCES}/${id}`)
      if (res.ok) {
        const fullData = await res.json()
        setActiveTask(fullData)
        setLinkedKeyframes(fullData.sequenceKeyframes || [])
      }
    } catch (err) { console.error("Failed to fetch sequence details", err) }
  }

  const fetchAllKeyframes = async () => {
    try {
      const res = await fetch(ENDPOINTS.KEYFRAMES)
      if (res.ok) setAllKeyframes(await res.json())
    } catch (err) { console.error("Failed to fetch all keyframes", err) }
  }

  // --- Function Logic : Sequences ---
  const handleAddNewTask = async () => {
    const title = prompt("請輸入新任務標題:")
    if (!title) return

    try {
      const res = await fetch(ENDPOINTS.SEQUENCES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          problemStatement: "<p>What problem are we solving?</p>",
          status: 'ACTIVE'
        })
      })
      if (res.ok) {
        const newTask = await res.json()
        setSequences([newTask, ...sequences])
        setActiveTask(newTask)
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("確定要刪除此任務嗎? 這將永久移除工作記錄。")) return
    try {
      const res = await fetch(`${ENDPOINTS.SEQUENCES}/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        if (activeTask?.id === taskId) setActiveTask(null)
        fetchSequences()
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
      const syncedValue = await syncContentImages(valueDelivered)

      // 更新本地狀態以反應同步後的結果
      setProblemStatement(syncedProblem)
      setValueDelivered(syncedValue)

      const res = await fetch(`${ENDPOINTS.SEQUENCES}/${activeTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          problemStatement: syncedProblem,
          valueDelivered: syncedValue,
          status: taskStatus
        })
      })
      if (res.ok) {
        setLastSaved(`Mission Synced @ ${new Date().toLocaleTimeString()}`)
        fetchSequences()
        fetchAllKeyframes()
      }
    } finally { setIsSaving(false) }
  }

  const handleAddFrame = async () => {
    if (!activeTask || !newFrameContent.trim()) return
    try {
      setIsSaving(true)
      const res = await fetch(`${ENDPOINTS.SEQUENCES}/${activeTask.id}/frames`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newFrameContent })
      })
      if (res.ok) {
        setNewFrameContent("")
        // 重新抓取詳情以更新留言列表
        fetchSequenceDetail(activeTask.id)
      }
    } catch (err) {
      console.error("Failed to add frame", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNewKeyframe = async () => {
    const title = prompt("請輸入新片段標題:")
    if (!title) return

    try {
      setIsSaving(true)
      const res = await fetch(ENDPOINTS.KEYFRAMES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          content: "<p>New keyframe content...</p>",
          domain: "GENERAL"
        })
      })
      if (res.ok) {
        const newKeyframe = await res.json()
        fetchAllKeyframes()
        setActiveTask(null)
        setActiveKeyframe(newKeyframe)
      }
    } finally { setIsSaving(false) }
  }

  const handleQuickAddKeyframe = async () => {
    if (!quickLinkTaskId || !quickFragmentTitle) return

    try {
      setIsSaving(true)
      // 注意：目前後端建立 Keyframe 暫未實作直接帶入 sequenceId 的自動關聯
      // 這裡我們先發送請求，後續再補齊後端關聯邏輯
      const res = await fetch(ENDPOINTS.KEYFRAMES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickFragmentTitle,
          content: "<p>Initial keyframe content...</p>",
          domain: quickFragmentDomain.toUpperCase(),
        })
      })
      if (res.ok) {
        const newKeyframe = await res.json()
        setQuickFragmentTitle('')
        setQuickLinkTaskId(null)
        setActiveTask(null)
        setActiveKeyframe(newKeyframe)
        fetchAllKeyframes()
      }
    } finally { setIsSaving(false) }
  }

  // 當開啟 Keyframe 編輯時同步狀態
  useEffect(() => {
    if (activeKeyframe) {
      setFragmentEditTitle(activeKeyframe.title || "Untitled Keyframe")
      setFragmentEditHook(activeKeyframe.hook || "")
      setFragmentEditContent(activeKeyframe.content || "")
    }
  }, [activeKeyframe])

  const handleDeleteKeyframe = async (keyframeId: string) => {
    if (!confirm("確定要刪除此知識碎片嗎? 這將永久移除錄入內容。")) return
    try {
      const res = await fetch(`${ENDPOINTS.KEYFRAMES}/${keyframeId}`, { method: 'DELETE' })
      if (res.ok) {
        setActiveKeyframe(null)
        setLastSaved(`Enlightenment Expunged @ ${new Date().toLocaleTimeString()}`)
        fetchAllKeyframes()
      }
    } catch (err) { console.error("Deletion failed", err) }
  }

  const handleUpdateKeyframe = async (newDomain?: string) => {
    if (!activeKeyframe) return
    try {
      setIsSaving(true)

      // 同步圖片
      const syncedContent = await syncContentImages(fragmentEditContent)
      setFragmentEditContent(syncedContent)

      const res = await fetch(`${ENDPOINTS.KEYFRAMES}/${activeKeyframe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fragmentEditTitle,
          content: syncedContent,
          hook: fragmentEditHook,
          domain: newDomain || activeKeyframe.domain
        })
      })
      if (res.ok) {
        setLastSaved(`Enlightenment Stored @ ${new Date().toLocaleTimeString()}`)
        fetchAllKeyframes()
        // 同步更新本地狀態以便展示正確內容
        setActiveKeyframe({
          ...activeKeyframe,
          title: fragmentEditTitle,
          content: syncedContent,
          hook: fragmentEditHook,
          domain: (newDomain || activeKeyframe.domain) as any
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
        className={`${isSidebarOpen ? 'border-r border-gray-800/60' : 'opacity-0'} bg-gray-900/10 h-screen ${isResizing ? '' : 'transition-[width,opacity] duration-300'} flex flex-col pt-8 pb-12 sticky top-0 overflow-hidden group/sidebar`}
      >
        <div className="px-6 mb-4 flex items-center justify-between font-black uppercase tracking-widest text-gray-500 text-[10px] min-w-[280px]">
          <div className="flex items-center gap-4 border-b border-gray-800 flex-1 pb-2">
            <SidebarTabButton active={sidebarTab === 'tasks'} onClick={() => setSidebarTab('tasks')} icon={Target} label="Tasks" colorClass="text-brand-500" />
            <SidebarTabButton active={sidebarTab === 'fragments'} onClick={() => setSidebarTab('fragments')} icon={FileText} label="Fragments" colorClass="text-knowledge-500" />
          </div>
          <div className="flex items-center gap-1 ml-4 pb-2">
            <button
              onClick={sidebarTab === 'tasks' ? handleAddNewTask : handleAddNewFragment}
              className={`p-1.5 hover:bg-gray-800 rounded-md transition-colors ${sidebarTab === 'tasks' ? 'text-brand-500' : 'text-knowledge-500'}`}
            >
              <Plus size={16} />
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-600"><PanelLeftClose size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 space-y-1 min-w-[280px]">
          {sidebarTab === 'tasks' ? (
            sequences.map(seq => (
              <SidebarItem
                key={seq.id}
                active={activeTask?.id === seq.id}
                onClick={() => { setActiveTask(seq); setActiveKeyframe(null); }}
                title={seq.title}
                subtitle={seq.status}
                activeColorClass="text-brand-500"
                onQuickAction={(e) => { e.stopPropagation(); setQuickLinkTaskId(seq.id); }}
                quickActionIcon={Plus}
                onDelete={(e) => { e.stopPropagation(); handleDeleteTask(seq.id); }}
              />
            ))
          ) : (
            allKeyframes.map(kf => (
              <SidebarItem
                key={kf.id}
                active={activeKeyframe?.id === kf.id}
                onClick={() => { setActiveKeyframe(kf); setActiveTask(null); }}
                title={kf.title || 'Untitled'}
                subtitle={kf.domain}
                activeColorClass="text-knowledge-400"
                onDelete={(e) => { e.stopPropagation(); handleDeleteKeyframe(kf.id); fetchAllKeyframes(); }}
              />
            ))
          )}
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-brand-500/30 transition-colors z-10"
        />
      </aside>

      {/* Main Viewport */}
      <main className={`flex-1 max-w-5xl mx-auto px-16 pt-8 pb-24 ${isResizing ? '' : 'transition-all duration-300'} relative`}>
        {activeTask ? (
          <div className="animate-in fade-in slide-in-from-bottom duration-500">
            <ViewHeader
              icon={KirbyIcon}
              title="Active Mission"
              id={activeTask.id}
              colorClass="text-brand-500"
            >
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="bg-gray-900 border border-gray-800 text-[10px] font-black uppercase text-brand-400 px-4 py-2 rounded-xl focus:outline-none">
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <button
                onClick={() => handleDeleteTask(activeTask.id)}
                className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-500 hover:border-red-500/40 transition-all active:scale-95 shadow-xl"
              >
                <Trash2 size={16} />
              </button>
              <button onClick={handleSaveTask} disabled={isSaving} className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-brand-600/10 uppercase tracking-widest">SYNC</button>
            </ViewHeader>

            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full text-2xl font-black bg-transparent border-none p-0 focus:outline-none mb-8 caret-brand-500 text-gray-100 placeholder:text-gray-800" placeholder="Task Title..." />

            <div className="space-y-3">
              <MissionField icon={Flag} label="Problem Statement" content={problemStatement} onChange={setProblemStatement} />
              <MissionField icon={Activity} label="Value Delivered" content={valueDelivered} onChange={setValueDelivered} />

              {/* --- 留言板 (Message Board) --- */}
              <div className="pt-8 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-2 mb-4 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] border-b border-gray-800/40 pb-1">
                  <History size={14} className="text-brand-500/50" />
                  Mission Timeline (Frames)
                </div>

                <div className="space-y-4 mb-6">
                  {activeTask.sequenceFrames?.length === 0 ? (
                    <div className="py-6 text-center border border-dashed border-gray-800/40 rounded-3xl text-[10px] text-gray-700 italic">
                      No logs recorded for this mission yet.
                    </div>
                  ) : (
                    activeTask.sequenceFrames?.map((sf, idx) => (
                      <div key={sf.frame.id || idx} className="group relative flex gap-4 p-4 bg-gray-900/10 border border-gray-800/20 rounded-2xl hover:border-brand-500/20 transition-all">
                        <div className="flex flex-col items-center">
                          <div className="w-1 h-full bg-gray-800 rounded-full group-last:bg-transparent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">
                              Frame #{idx + 1} — {new Date(sf.addedAt).toLocaleString()}
                            </span>
                          </div>
                          <div
                            className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sf.frame.content }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 新增留言區域 */}
                <div className="mt-4">
                  <div className="bg-gray-800/30 rounded-2xl border border-gray-800 p-2 focus-within:border-brand-500/40 transition-all shadow-inner">
                    <TiptapEditor
                      content={newFrameContent}
                      onChange={setNewFrameContent}
                    />
                    <div className="flex justify-end p-2 border-t border-gray-800/50 mt-2">
                      <button
                        onClick={handleAddFrame}
                        disabled={isSaving || !newFrameContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:hover:bg-brand-600 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-brand-600/10 uppercase tracking-widest"
                      >
                        <Plus size={14} /> Commit Frame
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
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
        ) : activeKeyframe ? (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <ViewHeader
              icon={FileText}
              title="Knowledge Fragment"
              id={activeKeyframe.id}
              colorClass="text-knowledge-500"
            >
              <select
                value={activeKeyframe.domain}
                onChange={(e) => handleUpdateKeyframe(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-[10px] font-black uppercase text-knowledge-400 px-4 py-2 rounded-xl focus:outline-none"
              >
                <option value="GENERAL">General</option>
                <option value="WORK">Work</option>
                <option value="PERSONAL">Personal</option>
                <option value="RESEARCH">Research</option>
                <option value="IDEA">Idea</option>
              </select>
              <button
                onClick={() => handleDeleteKeyframe(activeKeyframe.id)}
                className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-red-500 hover:border-red-500/40 transition-all active:scale-95 shadow-xl"
              >
                <Trash2 size={16} />
              </button>
              <button onClick={() => handleUpdateKeyframe()} disabled={isSaving} className="px-8 py-2.5 bg-knowledge-600 hover:bg-knowledge-500 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-knowledge-600/10 uppercase tracking-widest">STORE</button>
            </ViewHeader>

            <input value={fragmentEditTitle} onChange={(e) => setFragmentEditTitle(e.target.value)} className="w-full text-2xl font-black bg-transparent border-none p-0 focus:outline-none mb-4 caret-knowledge-500 text-gray-100 placeholder:text-gray-800" placeholder="Fragment Title..." />

            <div className="flex flex-wrap gap-2 mb-8">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900/50 border border-gray-800 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <Compass size={12} className="text-knowledge-500" />
                Domain: {activeKeyframe.domain}
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900/50 border border-gray-800 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <Clock size={12} className="text-knowledge-500" />
                Logged: {new Date(activeKeyframe.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-3">
              <MissionField icon={Compass} label="Epistemic Hook" content={fragmentEditHook} onChange={setFragmentEditHook} />
              <MissionField icon={FileText} label="Insight Depth" content={fragmentEditContent} onChange={setFragmentEditContent} />
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
              <div className="p-4 bg-knowledge-500/10 text-knowledge-500 rounded-2xl"><Plus size={24} /></div>
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
                  className="w-full bg-gray-900 border border-gray-800 p-4 rounded-3xl text-sm font-black text-knowledge-500 focus:outline-none"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Side_Project">Side Project</option>
                  <option value="Uncategorized">Uncategorized</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] ml-1">Point Title</label>
                <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-[2rem] focus-within:border-knowledge-500/30 transition-all">
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

            <button onClick={handleQuickAddFragment} disabled={!quickFragmentTitle || isSaving} className="w-full py-5 bg-knowledge-600 hover:bg-knowledge-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-knowledge-600/20 transition-all active:scale-[0.98]">ESTABLISH KNOWLEDGE EDGE</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
