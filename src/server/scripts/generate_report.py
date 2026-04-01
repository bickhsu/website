import os
import sys
from datetime import datetime, timedelta

# 加入專案根目錄到 path，確保可以正確 import server 模組
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(script_dir))
sys.path.append(project_root)

from dotenv import load_dotenv
import google.generativeai as genai

from server.database import DBSession
from server.models.executions import ExecutionUnit
from server.models.fragments import KnowledgeFragment


load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ 錯誤：找不到 GEMINI_API_KEY。請確認你的 .env 檔案已經設定好。")
    sys.exit(1)
genai.configure(api_key=GEMINI_API_KEY)


def get_recent_data(days=7):
    """從資料庫獲取最近幾天的 Task 和 Fragment"""
    db = DBSession()
    try:
        # 計算開始時間
        start_date = datetime.now() - timedelta(days=days)
        print(f"🔍 正在撈取 {start_date.strftime('%Y-%m-%d')} 之後的資料...")

        # 1. 抓取 Execution Units (Tasks)
        recent_tasks = db.query(ExecutionUnit).filter(
            ExecutionUnit.created_at >= start_date,
            ExecutionUnit.domain == 'Work'
        ).all()

        # 2. 抓取 Knowledge Fragments
        recent_fragments = db.query(KnowledgeFragment).filter(
            KnowledgeFragment.created_at >= start_date,
            KnowledgeFragment.domain == 'Work'
        ).all()

        return recent_tasks, recent_fragments
    finally:
        db.close()

def format_data_for_ai(tasks, fragments):
    """將 ORM 物件轉為給 AI 看的純文字（JSON 格式化太勞費 token，Markdown 比較好）"""
    output = "## 原始系統資料：本週記錄\n\n"
    
    output += "### 1. 任務與執行單元 (Tasks & Execution Units)\n"
    if not tasks:
        output += "(無資料)\n"
    for t in tasks:
        output += f"- 標題: {t.title} (Domain: {t.domain})\n"
        output += f"  狀態: {t.status}\n"
        output += f"  問題描述: {t.problem_statement}\n"
        output += f"  交付價值: {t.value_delivered}\n"
        output += f"  執行紀錄 (Log): {t.execution_log}\n\n"

    output += "### 2. 知識與實踐碎片 (Knowledge Fragments)\n"
    if not fragments:
        output += "(無資料)\n"
    for f in fragments:
        output += f"- 標題: {f.title} (Domain: {f.domain})\n"
        output += f"  內容: {f.content}\n"
        output += f"  Hook/心得: {f.hook}\n\n"

    return output

def main():
    # 1. 載入提示詞
    prompt_path = os.path.join(script_dir, "../prompts/weekly-report.md")
    if not os.path.exists(prompt_path):
        print(f"❌ 錯誤：找不到 prompt 檔案於 {prompt_path}")
        sys.exit(1)
        
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()

    # 2. 撈取資料
    tasks, fragments = get_recent_data(days=7)
    
    if len(tasks) == 0 and len(fragments) == 0:
        print("💡 這週沒有任何新增的 Task 或 Fragment，報告提早結束。")
        sys.exit(0)

    # 3. 整理資料成字串
    context_data = format_data_for_ai(tasks, fragments)
    
    # 4. 組合最終丟給 AI 的內容
    final_prompt = f"{system_prompt}\n\n---\n\n{context_data}\n\n請根據上方資料與規則產出週報："

    model = genai.GenerativeModel(
        model_name='gemini-3.1-pro-preview',
        system_instruction=system_prompt # 將讀取的 md 作為系統指令
    )

    print("\n⏳ 正在將資料送往 Gemini 生成週報，請稍候...\n")
    try:
        response = model.generate_content(final_prompt)
        
        # 5. 儲存結果
        output_dir = os.path.join(project_root, "reports")
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"weekly_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(response.text)
            
        print(f"🎉 週報產生成功！已儲存於: {filepath}")
        
    except Exception as e:
        print(f"❌ 呼叫 Gemini API 時發生錯誤: {str(e)}")

if __name__ == "__main__":
    main()
