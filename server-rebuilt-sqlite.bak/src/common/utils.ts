import { BadRequestException } from '@nestjs/common'

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string' || !value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function parseJsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  if (typeof value !== 'string' || !value) return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function toJsonString(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return fallback
    try {
      JSON.parse(trimmed)
      return trimmed
    } catch {
      return fallback
    }
  }
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

export function toPage(query: Record<string, unknown>, defaultPageSize = 20) {
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || defaultPageSize))
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export function toDate(value: unknown): Date | null {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export function toBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'boolean') return value
  const text = String(value).toLowerCase()
  if (['true', '1', 'yes'].includes(text)) return true
  if (['false', '0', 'no'].includes(text)) return false
  return undefined
}

export function relativeTime(date: Date | null | undefined): string {
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)}天前`
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    const value = body[field]
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new BadRequestException(`缺少必填字段：${field}`)
    }
  }
}

export function csvPayload(filename: string, headers: string[], rows: unknown[][]) {
  const escape = (cell: unknown) => {
    const text = cell === null || cell === undefined ? '' : String(cell)
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))]
  return {
    filename,
    mimeType: 'text/csv;charset=utf-8',
    content: `﻿${lines.join('\r\n')}`
  }
}

export function randomToken(length = 24): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i += 1) token += chars[Math.floor(Math.random() * chars.length)]
  return token
}

export function startOfDay(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}
