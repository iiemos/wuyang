const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

const now = new Date()
const day = 24 * 60 * 60 * 1000

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
      workTime: item.summary.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/)?.[0] || '时间面议',
      requirement: item.highlights.join('，'),
      settlement: item.tag
    }
  }
  if (item.type === 'houses') {
    return {
      community: item.address,
      layout: item.highlights.find((text) => text.includes('室')) || '',
      area: item.highlights.find((text) => text.includes('m')) || '',
      orientation: item.highlights.find((text) => text.includes('南')) || '',
      decoration: item.highlights.find((text) => text.includes('装')) || '',
      houseType: item.tag
    }
  }
  if (item.type === 'yellowPages') {
    return { serviceScope: item.address, serviceTags: item.highlights }
  }
  if (item.type === 'secondhand') {
    return { tradePlace: item.address, conditionTags: item.highlights }
  }
  if (item.type === 'convenience') {
    return { location: item.address, infoTags: item.highlights }
  }
  return {}
}

async function upsertAdminMenu(item, parentId = null) {
  const menu = await prisma.adminMenu.upsert({
    where: { path: item.path },
    update: {
      parentId,
      title: item.title,
      component: item.component || null,
      icon: item.icon || null,
      permission: item.permission || null,
      sortOrder: item.sortOrder,
      status: item.status || 'enabled'
    },
    create: {
      parentId,
      title: item.title,
      path: item.path,
      component: item.component || null,
      icon: item.icon || null,
      permission: item.permission || null,
      sortOrder: item.sortOrder,
      status: item.status || 'enabled'
    }
  })
  for (const child of item.children || []) {
    await upsertAdminMenu(child, menu.id)
  }
  return menu
}

async function main() {
  const permissions = [
    ['content:review', '内容审核'],
    ['report:handle', '举报处理'],
    ['user:manage', '用户管理'],
    ['ad:manage', '广告管理'],
    ['article:manage', '资讯管理'],
    ['system:setting', '系统设置'],
    ['rbac:manage', '权限管理'],
    ['menu:manage', '菜单管理']
  ]

  for (const [code, name] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: { code, name }
    })
  }

  const adminRole = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: { name: '超级管理员' },
    create: { code: 'super_admin', name: '超级管理员', description: '拥有全部后台权限' }
  })
  await prisma.role.upsert({
    where: { code: 'auditor' },
    update: { name: '内容审核员' },
    create: { code: 'auditor', name: '内容审核员', description: '审核内容与处理举报' }
  })
  await prisma.role.upsert({
    where: { code: 'operator' },
    update: { name: '运营人员' },
    create: { code: 'operator', name: '运营人员', description: '管理广告、置顶和资讯' }
  })

  const allPermissions = await prisma.permission.findMany()
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } })
  await prisma.rolePermission.createMany({
    data: allPermissions.map((permission) => ({ roleId: adminRole.id, permissionId: permission.id })),
    skipDuplicates: true
  })

  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'change_me_please'
  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash: await hash(password, 10),
      nickname: '超级管理员',
      status: 'active'
    },
    create: {
      username,
      passwordHash: await hash(password, 10),
      nickname: '超级管理员',
      status: 'active'
    }
  })
  await prisma.userRole.createMany({
    data: [{ userId: admin.id, roleId: adminRole.id }],
    skipDuplicates: true
  })

  const adminMenus = [
    { title: '仪表盘', path: '/dashboard', icon: 'DataLine', permission: 'content:review', sortOrder: 10 },
    {
      title: '内容管理',
      path: '/content',
      icon: 'Document',
      permission: 'content:review',
      sortOrder: 20,
      children: [
        { title: '招聘管理', path: '/content/recruitments', permission: 'content:review', sortOrder: 10 },
        { title: '房源管理', path: '/content/houses', permission: 'content:review', sortOrder: 20 },
        { title: '便民信息', path: '/content/conveniences', permission: 'content:review', sortOrder: 30 },
        { title: '商家服务', path: '/content/shops', permission: 'content:review', sortOrder: 40 },
        { title: '二手闲置', path: '/content/used-goods', permission: 'content:review', sortOrder: 50 },
        { title: '本地资讯', path: '/content/articles', permission: 'article:manage', sortOrder: 60 },
        { title: '精选推荐', path: '/content/featured', permission: 'content:review', sortOrder: 70 },
        { title: '分类管理', path: '/content/categories', permission: 'content:review', sortOrder: 80 }
      ]
    },
    {
      title: '用户管理',
      path: '/users',
      icon: 'User',
      permission: 'user:manage',
      sortOrder: 30,
      children: [
        { title: '用户列表', path: '/users/list', permission: 'user:manage', sortOrder: 10 },
        { title: '认证申请', path: '/users/certifications', permission: 'user:manage', sortOrder: 20 },
        { title: '举报反馈', path: '/users/reports', permission: 'report:handle', sortOrder: 30 }
      ]
    },
    {
      title: '运营管理',
      path: '/operation',
      icon: 'TrendCharts',
      permission: 'ad:manage',
      sortOrder: 40,
      children: [
        { title: '广告位管理', path: '/operation/ads', permission: 'ad:manage', sortOrder: 10 },
        { title: '置顶订单', path: '/operation/orders', permission: 'ad:manage', sortOrder: 20 },
        { title: '收入趋势', path: '/operation/revenue', permission: 'ad:manage', sortOrder: 30 }
      ]
    },
    {
      title: '系统管理',
      path: '/system',
      icon: 'Setting',
      permission: 'system:setting',
      sortOrder: 50,
      children: [
        { title: '平台配置', path: '/system/settings', permission: 'system:setting', sortOrder: 10 },
        { title: '敏感词', path: '/system/sensitive-words', permission: 'system:setting', sortOrder: 20 },
        { title: '公告通知', path: '/system/notices', permission: 'system:setting', sortOrder: 30 },
        { title: '角色权限', path: '/system/roles', permission: 'rbac:manage', sortOrder: 40 },
        { title: '管理员账号', path: '/system/accounts', permission: 'rbac:manage', sortOrder: 50 },
        { title: '操作日志', path: '/system/logs', permission: 'system:setting', sortOrder: 60 },
        { title: '菜单管理', path: '/system/menus', permission: 'menu:manage', sortOrder: 70 }
      ]
    }
  ]
  for (const menu of adminMenus) {
    await upsertAdminMenu(menu)
  }

  const publicUser = await prisma.user.upsert({
    where: { phone: '13800138001' },
    update: {},
    create: {
      nickname: '青柠用户',
      phone: '13800138001',
      publishCount: 12,
      favoriteCount: 28,
      viewCount: 136
    }
  })

  const contentItems = [
    { id: 'job-1', type: 'jobs', title: '青柠生鲜分拣员', tag: '全职', price: '4200-5600元/月', address: '舞阳县产业集聚区', contact: '王主管', phone: '13800138001', status: 'approved', isTop: true, isRecommended: true, highlights: ['包工作餐', '可预支', '经验不限'], summary: '负责生鲜到货分拣、打包和出库复核，月休4天，提供工作餐。', images: ['/uploads/sample-jobs.svg'] },
    { id: 'job-2', type: 'jobs', title: '周末奶茶店店员', tag: '兼职', price: '18元/小时', address: '人民路商圈', contact: '李店长', phone: '13800138002', status: 'approved', isTop: false, highlights: ['周末班', '就近安排', '氛围轻松'], summary: '周六日排班，负责点单、备料、出杯和门店清洁，学生可沟通。', images: ['/uploads/sample-jobs.svg'] },
    { id: 'job-3', type: 'jobs', title: '展会临时协助人员', tag: '临时工', price: '160元/天', address: '文化广场', contact: '赵主管', phone: '13800138003', status: 'approved', isTop: false, highlights: ['日结', '包午餐', '简单易上手'], summary: '协助展位引导、物料整理和现场秩序维护，工作时间 9:00-18:00。', images: ['/uploads/sample-jobs.svg'] },
    { id: 'house-1', type: 'houses', title: '中心城区两室一厅整租', tag: '出租', price: '1200元/月', address: '舞阳一高附近', contact: '刘女士', phone: '13800138011', status: 'approved', isTop: true, isRecommended: true, highlights: ['两室一厅', '精装', '可短租'], summary: '家具家电齐全，南北通透，可拎包入住。', images: ['/uploads/sample-houses.svg'] },
    { id: 'house-2', type: 'houses', title: '临街旺铺低价转让', tag: '商铺转让', price: '面议', address: '南京路北段', contact: '陈先生', phone: '13800138012', status: 'approved', isTop: false, highlights: ['临街', '客流好', '可空转'], summary: '适合餐饮、零售和美容行业，客流稳定。', images: ['/uploads/sample-houses.svg'] },
    { id: 'house-3', type: 'houses', title: '城南三室两厅出售', tag: '出售', price: '58万', address: '城南新区', contact: '周经理', phone: '13800138013', status: 'approved', isTop: false, highlights: ['电梯房', '满五', '采光好'], summary: '小区环境安静，近学校和公园，支持预约看房。', images: ['/uploads/sample-houses.svg'] },
    { id: 'life-1', type: 'convenience', title: '今晚舞阳到郑州东站', tag: '拼车', price: '80元/位', address: '舞阳汽车站出发', contact: '张师傅', phone: '13800138021', status: 'approved', isTop: true, highlights: ['车找人', '剩2座', '可拼单'], summary: '19:30出发，途经漯河高速口，剩余2座。', images: ['/uploads/sample-life.svg'] },
    { id: 'life-2', type: 'convenience', title: '文化路附近寻黑色双肩包', tag: '失物招领', price: '酬谢面议', address: '文化路公交站', contact: '马先生', phone: '13800138022', status: 'approved', isTop: false, highlights: ['急寻', '内有证件', '当面酬谢'], summary: '包内有身份证件和钥匙，如有线索请电话联系。', images: ['/uploads/sample-life.svg'] },
    { id: 'life-3', type: 'convenience', title: '求问城东靠谱开锁师傅', tag: '打听事', price: '求推荐', address: '城东片区', contact: '宋女士', phone: '13800138023', status: 'approved', isTop: false, highlights: ['本地推荐', '今晚需要'], summary: '门锁损坏，需要正规师傅上门处理。', images: ['/uploads/sample-life.svg'] },
    { id: 'shop-1', type: 'yellowPages', title: '小满家政清洁', tag: '家政', price: '4.9分', address: '城区全域上门', contact: '客服', phone: '13800138031', status: 'approved', isTop: true, isRecommended: true, highlights: ['上门快', '可开发票', '新人优惠'], summary: '日常保洁、开荒清洁、家电清洗。', images: ['/uploads/sample-shop.svg'] },
    { id: 'shop-2', type: 'yellowPages', title: '老街家常菜馆', tag: '餐饮', price: '人均35元', address: '老街东口', contact: '孙老板', phone: '13800138032', status: 'approved', isTop: false, highlights: ['包间', '外卖', '本地口味'], summary: '家常菜、团餐、生日宴均可提前预订。', images: ['/uploads/sample-shop.svg'] },
    { id: 'shop-3', type: 'yellowPages', title: '安心水电维修', tag: '维修', price: '30元起', address: '城区上门', contact: '郭师傅', phone: '13800138033', status: 'approved', isTop: false, highlights: ['快速上门', '明码标价', '售后保障'], summary: '水管、电路、灯具、卫浴安装维修。', images: ['/uploads/sample-shop.svg'] },
    { id: 'used-1', type: 'secondhand', title: '九成新儿童安全座椅', tag: '母婴', price: '260元', address: '城西自提', contact: '许女士', phone: '13800138041', status: 'approved', isTop: false, highlights: ['九成新', '可验货', '自提'], summary: '适合9个月到6岁儿童，功能正常。', images: ['/uploads/sample-used.svg'] },
    { id: 'used-2', type: 'secondhand', title: 'iPhone 13 128G 白色', tag: '手机', price: '2380元', address: '人民路面交', contact: '韩先生', phone: '13800138042', status: 'approved', isTop: true, highlights: ['国行', '电池87%', '可验机'], summary: '自用机，无拆修，支持现场验机。', images: ['/uploads/sample-used.svg'] },
    { id: 'used-3', type: 'secondhand', title: '小户型折叠餐桌', tag: '家具', price: '180元', address: '城北自提', contact: '田女士', phone: '13800138043', status: 'approved', isTop: false, highlights: ['可折叠', '成色好', '自提优惠'], summary: '适合小户型，桌面干净，无明显磕碰。', images: ['/uploads/sample-used.svg'] },
    { id: 'news-1', type: 'news', title: '县城春季便民服务周启动', tag: '民生', price: '置顶', address: '文化广场', contact: '平台编辑部', phone: '13800138051', status: 'approved', isTop: true, highlights: ['便民服务', '公益', '本周'], summary: '本周将在文化广场设置政策咨询、义诊、维修等便民服务摊位。', images: ['/uploads/sample-news.svg'] },
    { id: 'news-2', type: 'news', title: '周末亲子市集开放报名', tag: '活动', price: '免费报名', address: '滨河公园', contact: '平台编辑部', phone: '13800138052', status: 'approved', isTop: false, highlights: ['亲子', '周末', '市集'], summary: '手作、旧物交换和亲子游戏摊位同步招募中。', images: ['/uploads/sample-news.svg'] },
    { id: 'news-3', type: 'news', title: '城区道路临时施工提醒', tag: '公告', price: '出行提醒', address: '南京路南段', contact: '平台编辑部', phone: '13800138053', status: 'approved', isTop: false, highlights: ['公告', '绕行', '施工'], summary: '南京路南段将进行夜间施工，请过往车辆提前绕行。', images: ['/uploads/sample-news.svg'] }
  ]

  for (const item of contentItems) {
    await prisma.contentItem.upsert({
      where: { id: item.id },
      update: {
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
        isRecommended: Boolean(item.isRecommended),
        topPriority: item.isTop ? 9 : 0,
        summary: item.summary,
        details: contentDetails(item)
      },
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
        isRecommended: Boolean(item.isRecommended),
        topPriority: item.isTop ? 9 : 0,
        summary: item.summary,
        details: contentDetails(item),
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 3) * day)
      }
    })
    await syncContentAssets(item.id, item.highlights, item.images)
  }

  for (const [group, name] of [
    ['jobs', '全职'],
    ['jobs', '兼职'],
    ['jobs', '临时工'],
    ['houses', '出租'],
    ['houses', '出售'],
    ['houses', '商铺转让'],
    ['convenience', '拼车'],
    ['convenience', '失物招领'],
    ['convenience', '打听事'],
    ['convenience', '便民求助'],
    ['secondhand', '手机'],
    ['secondhand', '家电'],
    ['secondhand', '家具'],
    ['secondhand', '母婴'],
    ['yellowPages', '餐饮'],
    ['yellowPages', '家政'],
    ['yellowPages', '维修'],
    ['news', '民生'],
    ['news', '活动'],
    ['news', '公告']
  ]) {
    await prisma.resourceCategory.upsert({
      where: { group_name: { group, name } },
      update: {},
      create: { group, name }
    })
  }
  for (const name of ['民生热点', '活动预告', '政务公告']) {
    await prisma.articleCategory.upsert({ where: { name }, update: {}, create: { name } })
  }

  await prisma.company.upsert({
    where: { id: 'company-1' },
    update: {},
    create: { id: 'company-1', name: '青柠生鲜', status: 'verified', credit: 'A', jobs: 4, contact: '王主管' }
  })
  await prisma.agency.upsert({
    where: { id: 'agency-1' },
    update: {},
    create: { id: 'agency-1', name: '城东安居房产', broker: '周经理', status: 'verified', houses: 8, passRate: '92%' }
  })
  await prisma.certification.upsert({
    where: { id: 'cert-1' },
    update: {},
    create: { id: 'cert-1', applicant: '小满家政清洁', type: '企业认证', phone: '13800138031', material: '营业执照 + 门头照' }
  })
  await prisma.report.upsert({
    where: { id: 'report-1' },
    update: {},
    create: { id: 'report-1', targetId: 'house-1', targetTitle: '中心城区两室一厅整租', reason: '疑似重复房源', reporter: '本地用户A' }
  })

  const position = await prisma.adPosition.upsert({
    where: { id: 'ad-pos-1' },
    update: {},
    create: { id: 'ad-pos-1', name: '首页轮播图', scene: 'home', pv: 2680, uv: 1280, ctr: '4.8%' }
  })
  await prisma.ad.upsert({
    where: { id: 'ad-1' },
    update: { image: '/uploads/sample-banner.svg', linkType: 'category', linkValue: 'houses', status: 'enabled' },
    create: { id: 'ad-1', positionId: position.id, title: '找房指南', image: '/uploads/sample-banner.svg', linkType: 'category', linkValue: 'houses', status: 'enabled' }
  })
  await prisma.ad.upsert({
    where: { id: 'ad-2' },
    update: { image: '/uploads/sample-jobs.svg', linkType: 'category', linkValue: 'jobs', status: 'enabled' },
    create: { id: 'ad-2', positionId: position.id, title: '周末兼职专区', image: '/uploads/sample-jobs.svg', linkType: 'category', linkValue: 'jobs', status: 'enabled' }
  })
  await prisma.topOrder.upsert({
    where: { id: 'top-order-1' },
    update: {},
    create: {
      id: 'top-order-1',
      targetId: 'job-1',
      targetTitle: '青柠生鲜分拣员',
      buyer: '王主管',
      amount: 99,
      status: 'paid',
      startedAt: now,
      expiredAt: new Date(now.getTime() + 30 * day)
    }
  })

  await prisma.platformSetting.upsert({
    where: { id: 'platform' },
    update: {
      appName: '青柠本地生活',
      city: '舞阳',
      customerServicePhone: '13800138000',
      sensitiveStrategy: 'manual',
      newUserPublishDelayHours: 0
    },
    create: {
      id: 'platform',
      appName: '青柠本地生活',
      city: '舞阳',
      customerServicePhone: '13800138000',
      sensitiveStrategy: 'manual',
      newUserPublishDelayHours: 0
    }
  })
  await prisma.platformAuditRequiredType.deleteMany({ where: { settingId: 'platform' } })
  await prisma.platformAuditRequiredType.createMany({
    data: ['jobs', 'houses', 'convenience', 'yellowPages', 'secondhand'].map((type) => ({ settingId: 'platform', type })),
    skipDuplicates: true
  })
  await prisma.userFavorite.upsert({
    where: { userId_contentId: { userId: publicUser.id, contentId: 'house-1' } },
    update: {},
    create: { userId: publicUser.id, contentId: 'house-1' }
  })
  await prisma.userFavorite.upsert({
    where: { userId_contentId: { userId: publicUser.id, contentId: 'used-2' } },
    update: {},
    create: { userId: publicUser.id, contentId: 'used-2' }
  })
  await prisma.userBrowseHistory.upsert({
    where: { userId_contentId: { userId: publicUser.id, contentId: 'job-1' } },
    update: { viewCount: 3, viewedAt: now },
    create: { userId: publicUser.id, contentId: 'job-1', viewCount: 3, viewedAt: now }
  })
  await prisma.jobApplication.upsert({
    where: { userId_contentId: { userId: publicUser.id, contentId: 'job-2' } },
    update: {},
    create: { userId: publicUser.id, contentId: 'job-2' }
  })
  await prisma.sensitiveWord.upsert({ where: { word: '虚假招聘' }, update: {}, create: { word: '虚假招聘' } })
  await prisma.notice.upsert({
    where: { id: 'notice-1' },
    update: {},
    create: { id: 'notice-1', title: '发布规范提醒', content: '发布信息需真实有效，平台将进行抽审。' }
  })
  await prisma.message.upsert({
    where: { id: 'msg-1' },
    update: {},
    create: { id: 'msg-1', title: '系统提醒', body: '请及时更新已租、已售、已满员信息。' }
  })
  await prisma.message.upsert({
    where: { id: 'msg-2' },
    update: {},
    create: { id: 'msg-2', title: '审核通知', body: '你发布的信息审核通过后，将展示在对应频道。' }
  })
  await prisma.message.upsert({
    where: { id: 'msg-3' },
    update: { unread: false },
    create: { id: 'msg-3', title: '安全提示', body: '线下交易请核实对方身份，谨慎支付定金。', unread: false }
  })
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
