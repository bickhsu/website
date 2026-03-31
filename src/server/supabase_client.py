import os
from supabase import create_client, Client
from dotenv import load_dotenv

# 使用 override=True 確保讀取到我們在 .env 裡加的東西
load_dotenv(override=True)

url: str = os.getenv("SUPABASE_URL", "").strip()
key: str = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")).strip()

if not url:
    print("Warning: SUPABASE_URL is missing.")
if not key:
    print("Warning: SUPABASE KEY is missing.")

# 這裡先檢查，如果真的不對不要在啟動時崩掉以防影響其他功能
supabase_client: Client | None = None

if url and key:
    try:
        supabase_client = create_client(url, key)
        print(f"Supabase client initialized successfully at {url}")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
