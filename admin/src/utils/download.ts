export interface ExportPayload {
  filename: string
  mimeType: string
  content: string
}

export function downloadTextFile(payload: ExportPayload) {
  const blob = new Blob([payload.content], { type: payload.mimeType || 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = payload.filename || 'export.csv'
  link.click()
  URL.revokeObjectURL(url)
}
