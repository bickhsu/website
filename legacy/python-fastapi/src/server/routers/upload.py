import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from .supabase_client import supabase_client

router = APIRouter(prefix="/upload", tags=["upload"])

BUCKET_NAME = "images"

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase is not configured yet. Check .env variables.")

    # 檢查是否為圖片
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        # 讀取檔案內容
        contents = await file.read()
        
        # 產生隨機檔名
        file_ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
        file_path = f"editor/{uuid.uuid4()}{file_ext}"

        # 上傳到 Supabase Storage
        # 注意: 這裡使用 .storage.from_(BUCKET_NAME).upload
        # 我們假設 Bucket 已經存在
        res = supabase_client.storage.from_(BUCKET_NAME).upload(
            file_path, 
            contents,
            file_options={"content-type": file.content_type}
        )

        # 獲取 Public URL
        public_url = supabase_client.storage.from_(BUCKET_NAME).get_public_url(file_path)

        return {"url": public_url}
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()
