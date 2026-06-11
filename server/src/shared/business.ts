export const serviceCategories = [
  { type: 'jobs', label: '招聘', icon: 'lucide:job-tie', desc: '全职兼职临时工' },
  { type: 'houses', label: '房源', icon: 'lucide:house-market', desc: '出租出售转让' },
  { type: 'convenience', label: '便民', icon: 'lucide:hand-heart', desc: '拼车求助打听' },
  { type: 'yellowPages', label: '服务', icon: 'lucide:service-paint', desc: '本地商家服务' },
  { type: 'secondhand', label: '二手', icon: 'lucide:secondhand-clothes', desc: '闲置转让自提' },
  { type: 'news', label: '资讯', icon: 'lucide:newspaper', desc: '本地新鲜事' }
] as const

export const contentResourceMap = {
  recruitments: 'jobs',
  houses: 'houses',
  conveniences: 'convenience',
  convenience: 'convenience',
  'used-goods': 'secondhand',
  shops: 'yellowPages',
  articles: 'news'
} as const

export const publicStatuses = ['approved']
