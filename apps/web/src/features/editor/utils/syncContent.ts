import { uploadImage } from './uploadImage'

/**
 * 掃描 HTML 字串中的所有 Base64 圖片，將其上傳到伺服器並替換為 URL
 */
export const syncContentImages = async (html: string): Promise<string> => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const images = Array.from(doc.querySelectorAll('img'))
  
  let hasChanged = false

  for (const img of images) {
    const src = img.getAttribute('src')
    
    // 檢查是否為 Base64 圖片
    if (src && src.startsWith('data:image')) {
      try {
        // 將 Base64 轉回 File 物件以便上傳
        const response = await fetch(src)
        const blob = await response.blob()
        const file = new File([blob], 'pasted_image.png', { type: blob.type })
        
        // 上傳到後端
        const remoteUrl = await uploadImage(file)
        
        // 替換 src
        img.setAttribute('src', remoteUrl)
        hasChanged = true
      } catch (error) {
        console.error('Failed to sync image:', error)
      }
    }
  }

  return hasChanged ? doc.body.innerHTML : html
}
