const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const now = new Date()
const day = 24 * 60 * 60 * 1000

// 模拟数据生成器
const jobTitles = [
  '物流分拣员', '快递员', '餐饮送餐员', '保洁员', '保安', '超市收银员',
  '门店营业员', '仓库管理', '流水线工人', '打包员', '品控检验', '售后服务'
]

const houseTitles = [
  '城中心学区房', '新区高层公寓', '老小区小户型', '郊区别墅',
  '商业街铺面', '办公楼出租', '厂房出租', '仓库出租'
]

const lifeCategories = ['拼车', '代跑腿', '家修家装', '家政服务', '教育培训', '美容美发']
const shopCategories = ['餐饮', '美容', '维修', '教育', '医疗', '汽车', '房产', '二手回收']
const usedCategories = ['手机', '电脑', '家电', '家具', '图书', '运动']
const newsTopics = ['民生', '活动', '公告', '商业', '教育', '交通']

function generateJobs(count = 15) {
  const jobs = []
  const tags = ['全职', '兼职', '临时工']
  const prices = ['3500-4500元/月', '4500-6000元/月', '12-18元/小时', '150-200元/天']

  for (let i = 0; i < count; i++) {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)]
    const tag = tags[Math.floor(Math.random() * tags.length)]

    jobs.push({
      id: `job-seed-${i}`,
      type: 'jobs',
      title: title + (i > 0 ? ` - 地点${i}` : ''),
      tag,
      price: prices[Math.floor(Math.random() * prices.length)],
      address: ['舞阳县城', '沙河镇', '侯集镇', '保险乡', '工业园区'][Math.floor(Math.random() * 5)],
      contact: ['李先生', '王女士', '张主管', '陈老板', '赵经理'][Math.floor(Math.random() * 5)],
      phone: `1380013800${String(i).padStart(2, '0')}`,
      status: Math.random() > 0.2 ? 'approved' : 'pending',
      isTop: Math.random() > 0.7,
      isRecommended: Math.random() > 0.8,
      highlights: ['包工作餐', '可预支', '经验不限', '近地铁', '弹性工作'],
      summary: `${title}职位，诚聘多名员工，有意者请联系。`,
      images: ['/uploads/sample-jobs.svg']
    })
  }
  return jobs
}

function generateHouses(count = 12) {
  const houses = []
  const types = ['出租', '出售', '商铺转让', '写字楼出租']
  const prices = ['1200-2000元/月', '2000-3500元/月', '30-50万', '50-80万', '面议']

  for (let i = 0; i < count; i++) {
    const title = houseTitles[Math.floor(Math.random() * houseTitles.length)]
    const type = types[Math.floor(Math.random() * types.length)]

    houses.push({
      id: `house-seed-${i}`,
      type: 'houses',
      title: title + (i > 0 ? ` - ${i}` : ''),
      tag: type,
      price: prices[Math.floor(Math.random() * prices.length)],
      address: ['中心城区', '南京路', '人民路', '城南新区', '高新区'][Math.floor(Math.random() * 5)],
      contact: ['刘女士', '陈先生', '周经理', '孙房东', '何中介'][Math.floor(Math.random() * 5)],
      phone: `1380013801${String(i).padStart(2, '0')}`,
      status: Math.random() > 0.15 ? 'approved' : 'pending',
      isTop: Math.random() > 0.75,
      isRecommended: Math.random() > 0.85,
      highlights: ['精装修', '南北通透', '配套齐全', '采光好', '交通便利'],
      summary: `${title}，环境优雅，配套完善。`,
      images: ['/uploads/sample-houses.svg']
    })
  }
  return houses
}

function generateLifeServices(count = 10) {
  const services = []
  const categories = lifeCategories

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]

    services.push({
      id: `life-seed-${i}`,
      type: 'convenience',
      title: `${category}需求 - ${i + 1}`,
      tag: category,
      price: Math.random() > 0.5 ? '面议' : `${Math.floor(Math.random() * 500) + 50}元`,
      address: ['城西', '城东', '城南', '城北', '中心'][Math.floor(Math.random() * 5)],
      contact: ['李女士', '王先生', '张姐', '陈叔', '赵哥'][Math.floor(Math.random() * 5)],
      phone: `1380013802${String(i).padStart(2, '0')}`,
      status: Math.random() > 0.1 ? 'approved' : 'pending',
      isTop: Math.random() > 0.8,
      highlights: ['本地推荐', '靠谱', '快速响应', '价格实惠'],
      summary: `${category}求助，需要专业人士协助。`,
      images: ['/uploads/sample-life.svg']
    })
  }
  return services
}

function generateShops(count = 12) {
  const shops = []
  const categories = shopCategories

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const scores = ['4.8分', '4.7分', '4.6分', '4.5分']

    shops.push({
      id: `shop-seed-${i}`,
      type: 'yellowPages',
      title: `${category}商家 - ${i + 1}`,
      tag: category,
      price: scores[Math.floor(Math.random() * scores.length)],
      address: ['人民路', '南京路', '老街', '新街', '广场'][Math.floor(Math.random() * 5)],
      contact: ['老板', '店长', '经理', '客服'],
      phone: `1380013803${String(i).padStart(2, '0')}`,
      status: Math.random() > 0.1 ? 'approved' : 'pending',
      isTop: Math.random() > 0.75,
      isRecommended: Math.random() > 0.8,
      highlights: ['口碑好', '服务优', '价格公道', '可预约'],
      summary: `专业${category}服务，欢迎咨询。`,
      images: ['/uploads/sample-shop.svg']
    })
  }
  return shops
}

function generateUsedGoods(count = 12) {
  const goods = []
  const categories = usedCategories

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]

    goods.push({
      id: `used-seed-${i}`,
      type: 'secondhand',
      title: `${category}闲置品 - ${i + 1}`,
      tag: category,
      price: `${Math.floor(Math.random() * 5000) + 50}元`,
      address: ['城西自提', '城东面交', '中心自提', '邮寄', '当面交易'][Math.floor(Math.random() * 5)],
      contact: ['卖家A', '卖家B', '卖家C', '卖家D', '卖家E'][Math.floor(Math.random() * 5)],
      phone: `1380013804${String(i).padStart(2, '0')}`,
      status: Math.random() > 0.15 ? 'approved' : 'pending',
      isTop: Math.random() > 0.8,
      highlights: ['成色好', '可验货', '质量保证', '诚心出售'],
      summary: `九成新${category}，诚心出售。`,
      images: ['/uploads/sample-used.svg']
    })
  }
  return goods
}

function generateNews(count = 10) {
  const news = []
  const topics = newsTopics

  for (let i = 0; i < count; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)]

    news.push({
      id: `news-seed-${i}`,
      type: 'news',
      title: `${topic}话题 - 标题${i + 1}`,
      tag: topic,
      price: '置顶',
      address: '舞阳县',
      contact: '平台编辑部',
      phone: '13800138000',
      status: 'approved',
      isTop: Math.random() > 0.85,
      isRecommended: false,
      highlights: [topic, '本地新闻', '值得关注'],
      summary: `关于${topic}的相关资讯和报道。`,
      images: ['/uploads/sample-news.svg']
    })
  }
  return news
}

async function syncContentAssets(id, highlights = [], images = []) {
  await prisma.contentImage.deleteMany({ where: { contentId: id } })
  if (images.length) {
    await prisma.contentImage.createMany({
      data: images.map((url, index) => ({ contentId: id, url, sortOrder: index }))
    })
  }
  await prisma.contentHighlight.deleteMany({ where: { contentId: id } })
  if (highlights.length) {
    await prisma.contentHighlight.createMany({
      data: highlights.map((text, index) => ({ contentId: id, text, sortOrder: index }))
    })
  }
}

function contentDetails(item) {
  if (item.type === 'jobs') {
    return {
      workDate: item.tag === '兼职' ? '周末' : '长期',
      workTime: '09:00-18:00',
      requirement: item.highlights.join('，'),
      settlement: item.tag
    }
  }
  if (item.type === 'houses') {
    return {
      community: item.address,
      layout: '2室1厅',
      area: '85-120㎡',
      orientation: '南北朝向',
      decoration: '精装修',
      houseType: item.tag
    }
  }
  return {}
}

async function main() {
  console.log('🌱 开始增强数据...')

  const allJobs = generateJobs(15)
  const allHouses = generateHouses(12)
  const allLife = generateLifeServices(10)
  const allShops = generateShops(12)
  const allUsed = generateUsedGoods(12)
  const allNews = generateNews(10)

  const allContent = [...allJobs, ...allHouses, ...allLife, ...allShops, ...allUsed, ...allNews]

  console.log(`📝 准备添加 ${allContent.length} 条内容...`)

  let count = 0
  for (const item of allContent) {
    try {
      await prisma.contentItem.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          type: item.type,
          title: item.title,
          tag: item.tag,
          price: item.price,
          address: item.address,
          contact: item.contact,
          phone: item.phone,
          publisher: item.contact,
          status: item.status,
          isTop: item.isTop,
          isRecommended: item.isRecommended,
          topPriority: item.isTop ? 9 : 0,
          summary: item.summary,
          details: contentDetails(item),
          createdAt: new Date(now.getTime() - Math.floor(Math.random() * 7) * day)
        }
      })
      await syncContentAssets(item.id, item.highlights, item.images)
      count++
    } catch (error) {
      console.error(`❌ 添加 ${item.id} 失败:`, error.message)
    }
  }

  console.log(`✅ 成功添加 ${count} 条内容！`)

  // 添加一些额外的用户和交互
  console.log('👥 添加额外用户和交互...')

  const users = []
  for (let i = 0; i < 8; i++) {
    const user = await prisma.user.create({
      data: {
        nickname: `用户${i + 1}`,
        phone: `1390000000${String(i).padStart(2, '0')}`,
        publishCount: Math.floor(Math.random() * 20),
        favoriteCount: Math.floor(Math.random() * 50),
        viewCount: Math.floor(Math.random() * 200)
      }
    })
    users.push(user)
  }

  // 添加收藏和浏览历史
  let interactionCount = 0
  for (const user of users) {
    const contentToFavorite = allContent.slice(0, Math.floor(Math.random() * 10) + 1)
    for (const item of contentToFavorite) {
      try {
        await prisma.userFavorite.create({
          data: {
            userId: user.id,
            contentId: item.id
          }
        })
        interactionCount++
      } catch (e) {
        // 忽略重复
      }
    }

    // 添加浏览历史
    const contentToBrowse = allContent.slice(0, Math.floor(Math.random() * 15) + 1)
    for (const item of contentToBrowse) {
      try {
        await prisma.userBrowseHistory.create({
          data: {
            userId: user.id,
            contentId: item.id,
            viewCount: Math.floor(Math.random() * 5) + 1
          }
        })
        interactionCount++
      } catch (e) {
        // 忽略重复
      }
    }
  }

  console.log(`✅ 添加了 ${users.length} 个用户，${interactionCount} 条交互记录！`)
}

main()
  .then(() => {
    console.log('\n🎉 数据增强完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 数据增强失败:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
