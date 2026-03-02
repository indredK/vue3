export interface FileItem {
  name: string
  size: number
  type: string
  url?: string
  uid?: number
  raw?: File
  status?: 'ready' | 'uploading' | 'success' | 'failed'
  percentage?: number
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : ''
}

export function getFileName(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(0, lastDot) : filename
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let sizeValue = bytes

  while (sizeValue >= 1024 && unitIndex < units.length - 1) {
    sizeValue /= 1024
    unitIndex++
  }

  return `${sizeValue.toFixed(2)} ${units[unitIndex]}`
}

export function isImageFile(file: File | string): boolean {
  const type = typeof file === 'string' ? file : file.type
  return /^image\//.test(type)
}

export function isVideoFile(file: File | string): boolean {
  const type = typeof file === 'string' ? file : file.type
  return /^video\//.test(type)
}

export function isPdfFile(file: File | string): boolean {
  const type = typeof file === 'string' ? file : file.type
  return type === 'application/pdf'
}

export function isExcelFile(file: File | string): boolean {
  const type = typeof file === 'string' ? file : file.type
  return /^(application\/vnd\.(ms-excel|excel)|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/.test(type)
}

export function isWordFile(file: File | string): boolean {
  const type = typeof file === 'string' ? file : file.type
  return /^(application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/.test(type)
}

export function isCompressedFile(file: File | string): boolean {
  const type = typeof file === 'string' ? file : file.type
  return /^(application\/(zip|x-zip-compressed|rar|x-rar|x-7z-compressed))$/.test(type)
}

export function validateFile(file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { valid: boolean; message?: string } {
  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      message: `文件大小不能超过 ${formatFileSize(options.maxSize)}`
    }
  }

  if (options.allowedTypes && options.allowedTypes.length > 0) {
    const fileType = file.type.toLowerCase()
    const isValidType = options.allowedTypes.some(type => 
      type.toLowerCase() === fileType || fileType.includes(type.toLowerCase())
    )
    if (!isValidType) {
      return {
        valid: false,
        message: `文件类型不允许，当前支持: ${options.allowedTypes.join(', ')}`
      }
    }
  }

  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const ext = getFileExtension(file.name).toLowerCase()
    if (!options.allowedExtensions.some(e => e.toLowerCase() === ext)) {
      return {
        valid: false,
        message: `文件扩展名不允许，当前支持: ${options.allowedExtensions.join(', ')}`
      }
    }
  }

  return { valid: true }
}

export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

export function downloadText(text: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([text], { type: mimeType })
  downloadBlob(blob, filename)
}

export function downloadJson(data: any, filename: string): void {
  const text = JSON.stringify(data, null, 2)
  downloadText(text, filename, 'application/json')
}

export function createImageUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

export function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: file.lastModified
                })
              )
            } else {
              reject(new Error('Image compression failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(img.error)
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    json: 'application/json',
    xml: 'application/xml',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo'
  }

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}

export function previewFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isImageFile(file)) {
      readFileAsDataURL(file).then(resolve).catch(reject)
    } else if (isPdfFile(file)) {
      readFileAsDataURL(file).then(resolve).catch(reject)
    } else {
      reject(new Error('Unsupported file type for preview'))
    }
  })
}
