export const serviceCategories = [
  { type: 'jobs', label: '招聘', icon: 'lucide:job-tie', desc: '全职兼职临时工' },
  { type: 'houses', label: '房源', icon: 'lucide:house-market', desc: '出租出售转让' },
  { type: 'convenience', label: '便民', icon: 'lucide:hand-heart', desc: '拼车求助打听' },
  { type: 'yellowPages', label: '服务', icon: 'lucide:service-paint', desc: '本地商家服务' },
  { type: 'secondhand', label: '二手', icon: 'lucide:secondhand-clothes', desc: '闲置转让自提' },
  { type: 'news', label: '资讯', icon: 'lucide:newspaper', desc: '本地新鲜事' }
]

export const categoryMeta = {
  jobs: {
    title: '招聘求职',
    subtitle: '附近高频岗位实时看',
    tabs: ['全部', '全职', '兼职', '临时工'],
    filters: ['薪资', '距离', '包食宿']
  },
  houses: {
    title: '租房二手房',
    subtitle: '整租、出售、商铺转让',
    tabs: ['全部', '出租', '出售', '商铺转让'],
    filters: ['价格', '户型', '区域']
  },
  convenience: {
    title: '便民信息',
    subtitle: '拼车、失物、求助都在这里',
    tabs: ['全部', '拼车', '失物招领', '打听事', '便民求助'],
    filters: []
  },
  yellowPages: {
    title: '商家服务',
    subtitle: '靠谱本地商家快速找',
    tabs: ['全部', '餐饮', '家政', '装修', '维修'],
    filters: []
  },
  secondhand: {
    title: '二手闲置',
    subtitle: '同城好物轻松转',
    tabs: ['全部', '手机', '家电', '家具', '母婴', '其他'],
    filters: []
  },
  news: {
    title: '本地资讯',
    subtitle: '精选城市动态',
    tabs: ['全部', '民生', '活动', '公告'],
    filters: []
  }
}
