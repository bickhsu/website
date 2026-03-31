export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  // 假設後端跑在 http://localhost:8000
  // 在開發環境你可以使用相對路徑或是寫死網址，通常建議用相對路徑或是環境變數
  const response = await fetch('http://localhost:8000/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Upload failed: ${errorText}`)
  }

  const data = await response.json()
  return data.url
}
