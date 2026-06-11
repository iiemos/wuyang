import { parseJsonArray, parseJsonObject, relativeTime } from './utils'

export const RESOURCE_TYPE: Record<string, string> = {
  recruitments: 'jobs',
  houses: 'houses',
  conveniences: 'convenience',
  'used-goods': 'secondhand',
  shops: 'yellowPages',
  articles: 'news'
}

export const TYPE_LABELS: Record<string, string> = {
  jobs: '招聘',
  houses: '房源',
  convenience: '便民',
  yellowPages: '商家',
  secondhand: '二手',
  news: '资讯'
}

export const CONTENT_TYPES = Object.keys(TYPE_LABELS)

export interface SerializeOptions {
  forUser?: boolean
  isFavorite?: boolean
  applicantCount?: number
  favoriteCount?: number
}

export function serializeListing(listing: any, options: SerializeOptions = {}) {
  if (!listing) return listing
  const topExpired = listing.isTop && listing.topExpireAt && new Date(listing.topExpireAt).getTime() < Date.now()
  const base: Record<string, unknown> = {
    id: listing.id,
    type: listing.type,
    tag: listing.tag || '',
    title: listing.title,
    price: listing.price || '',
    address: listing.address || '',
    contact: listing.contact || '',
    phone: listing.phone || '',
    publisher: listing.publisher || '',
    company: listing.company || '',
    ownerType: listing.ownerType || '个人',
    status: listing.status,
    summary: listing.summary || '',
    highlights: parseJsonArray(listing.highlights),
    images: parseJsonArray(listing.images),
    details: parseJsonObject(listing.details),
    rejectReason: listing.rejectReason || '',
    isTop: Boolean(listing.isTop) && !topExpired,
    topPriority: listing.topPriority || 0,
    topExpireAt: listing.topExpireAt ? new Date(listing.topExpireAt).toISOString() : null,
    isRecommended: Boolean(listing.isRecommended),
    viewCount: listing.viewCount || 0,
    createdAt: listing.createdAt ? new Date(listing.createdAt).toISOString() : null,
    updatedAt: listing.updatedAt ? new Date(listing.updatedAt).toISOString() : null
  }
  if (options.forUser) {
    base.time = relativeTime(listing.createdAt ? new Date(listing.createdAt) : null)
    base.isFavorite = Boolean(options.isFavorite)
    if (options.applicantCount !== undefined) base.applicantCount = options.applicantCount
    if (options.favoriteCount !== undefined) base.favoriteCount = options.favoriteCount
  }
  return base
}
