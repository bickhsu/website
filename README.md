# Context-Aware Mission & Knowledge Extraction System (Sequence & Frames)

一個專案開發者的「雙軌制」思考追蹤與知識提煉工具。

## 核心設計哲學 (Core Philosophy)

> **「捕捉當下發散的 Frame，提煉伴隨一生的 Keyframe。」**

本專案解決「筆記只有結論，沒有過程」的痛點。它讓開發者在執行任務時透過「影格 (Frame)」紀錄思考日誌，並在任務結束後透過「提煉 (Promote)」機制產生結構化的知識。

---

## 領域實體定義 (Domain Entities)

為了讓 AI 更好理解本專案的邏輯，以下是核心實體的技術定義：

### 1. Sequence (序列 / 任務主體)
- **定義**：代表一個完整的任務循環或專案開發過程。
- **核心欄位**：`title`, `problemStatement`, `valueDelivered`, `status` (ACTIVE/ARCHIVED)。
- **關係**：一對多關聯 Frames。

### 2. Frame (影格 / 過程日誌)
- **定義**：任務執行過程中的最小資訊單位。呈現方式類似聊天室的 Timeline。
- **核心欄位**：`content` (Rich Text/Code Blocks), `addedAt`。
- **行為**：每一則 Frame 都可以被「提煉 (Promote)」為 Keyframe。

### 3. Keyframe (關鍵影格 / 精華知識)
- **定義**：從日誌中淬煉出的核心結論，屬於永久知識庫（Second Brain）。
- **核心欄位**：`title`, `hook` (喚醒記憶的短語), `content`, `domain` (GENERAL/WORK/PERSONAL)。
- **關係**：透過 `SequenceKeyframe` 多對多關聯表，達成知識與原始任務的溯源追蹤。

---

## 系統工作流 (Workflow for Developers)

1. **Capture (捕捉)**：在 `Sequence` 下新增 `Frame` 記錄即時想法或 Debug 過程。
2. **Refine (精煉)**：任務結束後，選擇關鍵 Frame 進行 **Promote**。
3. **Trace (溯源)**：在查看 `Keyframe` 時，可一鍵點擊跳回當初產出該知識的 `Sequence` 案發現場。

---

## 技術架構 (Technical Stack)

- **Monorepo 管理**：`apps/api` (後端), `apps/web` (前端)。
- **Backend**：NestJS + PostgreSQL + Prisma ORM。
- **Frontend**：React (Vite) + Tailwind CSS。
- **Rich Text**：Tiptap Editor (高度客製化，支援 Markdown 與 Code Snippets)。

## 如何啟動 (Getting Started)

1. **環境變數**：複製 `.env.example` 到 `.env` 並配置資料庫。
2. **依賴安裝**：於根目錄執行 `npm install`。
3. **啟動開發視窗**：
   - 後端：`cd apps/api && npm run start:dev`
   - 前端：`cd apps/web && npm run dev`

