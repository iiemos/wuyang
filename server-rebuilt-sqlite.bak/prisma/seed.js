/* eslint-disable */
// 初始化种子数据：node prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const DEMO_USER_ID = 'demo-user'

function bannerSvg(title, from, to) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="320" viewBox="0 0 750 320">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="750" height="320" rx="24" fill="url(#g)"/>
  <circle cx="640" cy="60" r="120" fill="#ffffff" opacity="0.12"/>
  <circle cx="80" cy="280" r="90" fill="#ffffff" opacity="0.10"/>
  <text x="60" y="150" font-size="52" font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="#ffffff" font-weight="bold">${title}</text>
  <text x="60" y="215" font-size="28" font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="#ffffff" opacity="0.85">青柠本地生活 · 同城信息服务</text>
</svg>`
}

function writeBannerFiles() {
  const uploadsDir = path.join(__dirname, '..', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const banners = [
    { file: 'seed-banner-1.svg', title: '本地好工作 快人一步', from: '#18d65f', to: '#0a7d3b' },
    { file: 'seed-banner-2.svg', title: '安心找房 一站直达', from: '#ff7a45', to: '#d4380d' },
    { file: 'seed-banner-3.svg', title: '闲置流转 绿色生活', from: '#4096ff', to: '#1d39c4' }
  ]
  for (const banner of banners) {
    fs.writeFileSync(path.join(uploadsDir, banner.file), bannerSvg(banner.title, banner.from, banner.to), 'utf8')
  }
}

const PERMISSIONS = [
  { code: 'content:review', name: '内容审核', description: '审核招聘/房源/便民/二手/商家信息' },
  { code: 'article:manage', name: '资讯管理', description: '发布和管理本地资讯' },
  { code: 'user:manage', name: '用户管理', description: '用户列表、封禁、认证审核' },
  { code: 'report:handle', name: '举报处理', description: '处理用户举报' },
  { code: 'ad:manage', name: '运营管理', description: '广告位、置顶订单、收入' },
  { code: 'system:setting', name: '系统设置', description: '平台配置、敏感词、公告' },
  { code: 'rbac:manage', name: '角色权限', description: '角色、权限、管理员账号' },
  { code: 'menu:manage', name: '菜单管理', description: '后台菜单配置' }
]

const ROLES = [
  { code: 'super_admin', name: '超级管理员', description: '拥有全部权限', permissions: PERMISSIONS.map((p) => p.code) },
  { code: 'auditor', name: '内容审核员', description: '审核各类信息与举报', permissions: ['content:review', 'report:handle'] },
  { code: 'operator', name: '运营人员', description: '置顶、广告位与资讯', permissions: ['ad:manage', 'article:manage', 'content:review'] },
  { code: 'customer_service', name: '客服人员', description: '用户与举报处理', permissions: ['user:manage', 'report:handle'] }
]

const MENUS = [
  { key: 'dashboard', title: '仪表盘', path: '/dashboard', icon: 'DataLine', permission: 'content:review', sortOrder: 10 },
  {
    key: 'content', title: '内容管理', path: '/content', icon: 'Document', sortOrder: 20,
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
    key: 'users', title: '用户管理', path: '/users', icon: 'User', sortOrder: 30,
    children: [
      { title: '用户列表', path: '/users/list', permission: 'user:manage', sortOrder: 10 },
      { title: '认证申请', path: '/users/certifications', permission: 'user:manage', sortOrder: 20 },
      { title: '举报反馈', path: '/users/reports', permission: 'report:handle', sortOrder: 30 }
    ]
  },
  {
    key: 'operation', title: '运营管理', path: '/operation', icon: 'TrendCharts', sortOrder: 40,
    children: [
      { title: '广告位管理', path: '/operation/ads', permission: 'ad:manage', sortOrder: 10 },
      { title: '置顶订单', path: '/operation/orders', permission: 'ad:manage', sortOrder: 20 },
      { title: '收入趋势', path: '/operation/revenue', permission: 'ad:manage', sortOrder: 30 }
    ]
  },
  {
    key: 'system', title: '系统管理', path: '/system', icon: 'Setting', sortOrder: 50,
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

const CATEGORIES = {
  jobs: ['全职', '兼职', '临时工', '招工'],
  houses: ['出售', '出租', '商铺转让'],
  convenience: ['拼车', '失物招领', '打听事', '便民求助'],
  yellowPages: ['餐饮美食', '家政保洁', '维修安装', '教育培训', '婚庆摄影', '休闲娱乐'],
  secondhand: ['手机数码', '家用电器', '家具家居', '母婴用品', '其他闲置'],
  news: ['政务公告', '民生热点', '活动预告', '生活攻略']
}

function daysAgo(days, hours = 0) {
  return new Date(Date.now() - days * 86400000 - hours * 3600000)
}

async function main() {
  const existed = await prisma.adminUser.findUnique({ where: { username: 'admin' } })
  if (existed) {
    console.log('seed: 检测到已初始化（admin 账号已存在），跳过。如需重置请删除 prisma/dev.db 后重新执行。')
    return
  }

  writeBannerFiles()

  // ---------- RBAC ----------
  const permissionMap = {}
  for (const permission of PERMISSIONS) {
    permissionMap[permission.code] = await prisma.permission.create({ data: permission })
  }
  const roleMap = {}
  for (const role of ROLES) {
    const created = await prisma.role.create({
      data: { code: role.code, name: role.name, description: role.description }
    })
    roleMap[role.code] = created
    for (const code of role.permissions) {
      await prisma.rolePermission.create({ data: { roleId: created.id, permissionId: permissionMap[code].id } })
    }
  }

  const admin = await prisma.adminUser.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('change_me_please', 10),
      nickname: '超级管理员',
      status: 'active'
    }
  })
  await prisma.adminUserRole.create({ data: { adminUserId: admin.id, roleId: roleMap.super_admin.id } })

  const auditor = await prisma.adminUser.create({
    data: {
      username: 'auditor',
      password: await bcrypt.hash('auditor123', 10),
      nickname: '审核员小李',
      status: 'active'
    }
  })
  await prisma.adminUserRole.create({ data: { adminUserId: auditor.id, roleId: roleMap.auditor.id } })

  // ---------- 菜单 ----------
  for (const menu of MENUS) {
    const parent = await prisma.adminMenu.create({
      data: {
        title: menu.title,
        path: menu.path,
        icon: menu.icon || null,
        permission: menu.permission || null,
        sortOrder: menu.sortOrder
      }
    })
    for (const child of menu.children || []) {
      await prisma.adminMenu.create({
        data: {
          parentId: parent.id,
          title: child.title,
          path: child.path,
          permission: child.permission || null,
          sortOrder: child.sortOrder
        }
      })
    }
  }

  // ---------- 分类 ----------
  for (const [group, names] of Object.entries(CATEGORIES)) {
    for (let i = 0; i < names.length; i += 1) {
      await prisma.category.create({ data: { group, name: names[i], sortOrder: (i + 1) * 10 } })
    }
  }

  // ---------- 用户 ----------
  const demoUser = await prisma.user.create({
    data: { id: DEMO_USER_ID, nickname: '青柠用户', phone: '13800000000', createdAt: daysAgo(30) }
  })
  const publishers = []
  const publisherSeeds = [
    { nickname: '舞阳人力资源', phone: '13703950001', createdAt: daysAgo(60) },
    { nickname: '城东房产小王', phone: '13703950002', createdAt: daysAgo(45) },
    { nickname: '热心市民老张', phone: '13703950003', createdAt: daysAgo(20) },
    { nickname: '川香居老板', phone: '13703950004', createdAt: daysAgo(90) },
    { nickname: '数码达人小陈', phone: '13703950005', createdAt: daysAgo(15) },
    { nickname: '违规测试账号', phone: '13703950006', createdAt: daysAgo(10), status: 'banned' }
  ]
  for (const seed of publisherSeeds) {
    publishers.push(await prisma.user.create({ data: seed }))
  }

  // ---------- 信息 ----------
  const listings = [
    // 招聘
    {
      type: 'jobs', tag: '全职', title: '诚聘缝纫工 包吃住 月薪5000-8000', price: '5000-8000元/月',
      address: '舞阳县产业集聚区服装厂', contact: '刘厂长', phone: '13703950001', publisher: '舞阳人力资源',
      company: '舞阳衣尚服饰有限公司', ownerType: '企业', status: 'approved', isTop: true, topPriority: 10,
      topExpireAt: daysAgo(-7), isRecommended: true, viewCount: 326, userId: publishers[0].id, createdAt: daysAgo(1),
      summary: '工作内容：服装流水线缝纫，有经验者优先，可培训。\n薪资待遇：底薪+计件，月薪5000-8000元。\n福利：包吃包住、缴纳保险、全勤奖。',
      highlights: ['包吃住', '月结', '缴纳保险', '可培训'],
      details: { workTime: '8:30-18:00 月休4天', settlement: '月结', experience: '不限', positions: 20 }
    },
    {
      type: 'jobs', tag: '兼职', title: '周末促销员 日结150元', price: '150元/天',
      address: '舞阳县中心广场超市', contact: '王经理', phone: '13703950011', publisher: '舞阳人力资源',
      company: '惠民超市', ownerType: '企业', status: 'approved', isRecommended: true, viewCount: 158,
      userId: publishers[0].id, createdAt: daysAgo(2),
      summary: '周六周日商超促销，主要负责饮品试饮推广，日结工资，适合学生和宝妈。',
      highlights: ['日结', '周末', '适合学生'],
      details: { workTime: '周六日 9:00-17:00', settlement: '日结', experience: '不限' }
    },
    {
      type: 'jobs', tag: '临时工', title: '急招装卸工10名 完工结算', price: '200-260元/天',
      address: '舞阳县物流园区', contact: '赵师傅', phone: '13703950012', publisher: '热心市民老张',
      ownerType: '个人', status: 'approved', viewCount: 96, userId: publishers[2].id, createdAt: daysAgo(0, 5),
      summary: '物流园仓库装卸，按车结算，干完当场结清，要求能吃苦，身体健康。',
      highlights: ['完工结算', '当日上岗'],
      details: { workTime: '随到随干', settlement: '完工结算' }
    },
    {
      type: 'jobs', tag: '全职', title: '招聘前台文员 双休五险', price: '3000-3800元/月',
      address: '舞阳县北京路写字楼', contact: '人事部', phone: '13703950013', publisher: '舞阳人力资源',
      company: '宏远商贸', ownerType: '企业', status: 'pending', viewCount: 0, userId: publishers[0].id, createdAt: daysAgo(0, 2),
      summary: '负责前台接待、文件整理、电话接转。要求形象气质佳，熟练使用办公软件。',
      highlights: ['双休', '五险'],
      details: { workTime: '9:00-17:30 双休', settlement: '月结', experience: '1年以上' }
    },
    // 房源
    {
      type: 'houses', tag: '出售', title: '建业森林半岛 3室2厅 精装修 拎包入住', price: '68万元',
      address: '舞阳县建业森林半岛小区', contact: '小王', phone: '13703950002', publisher: '城东房产小王',
      ownerType: '中介', status: 'approved', isTop: true, topPriority: 8, topExpireAt: daysAgo(-5),
      isRecommended: true, viewCount: 412, userId: publishers[1].id, createdAt: daysAgo(3),
      summary: '小区：建业森林半岛\n面积：128m²\n户型：3室2厅2卫\n楼层：12层 / 总26层\n朝向：南北通透\n装修：精装修\n房屋类型：商品房住宅\n配套：学校、医院、商超齐全',
      highlights: ['128m²', '3室2厅2卫', '南北通透', '精装修', '学区房'],
      details: { community: '建业森林半岛', area: '128m²', layout: '3室2厅2卫', floor: '12层 / 总26层', orientation: '南北', decoration: '精装修', houseType: '商品房住宅', expectedPrice: '68万元' }
    },
    {
      type: 'houses', tag: '出租', title: '县中心两室一厅 家电齐全 月租900', price: '900元/月',
      address: '舞阳县人民路阳光小区', contact: '陈女士', phone: '13703950021', publisher: '城东房产小王',
      ownerType: '个人', status: 'approved', isRecommended: true, viewCount: 233, userId: publishers[1].id, createdAt: daysAgo(1, 4),
      summary: '出租方式：整套出租\n小区：阳光小区\n面积：86m²\n户型：2室1厅1卫\n楼层：4层 / 总6层\n付款方式：押一付三\n家具家电齐全，拎包入住，看房方便。',
      highlights: ['整套出租', '86m²', '2室1厅1卫', '押一付三', '拎包入住'],
      details: { community: '阳光小区', area: '86m²', layout: '2室1厅1卫', floor: '4层 / 总6层', orientation: '南', decoration: '简装修', houseType: '住宅出租', rentType: '整套出租', payment: '押一付三' }
    },
    {
      type: 'houses', tag: '商铺转让', title: '学校门口奶茶店转让 接手即营业', price: '面议',
      address: '舞阳县第一高中南门', contact: '李老板', phone: '13703950022', publisher: '热心市民老张',
      ownerType: '个人', status: 'approved', viewCount: 145, userId: publishers[2].id, createdAt: daysAgo(4),
      summary: '商铺40m²，设备齐全（制冰机、封口机、操作台），客源稳定，因家中有事忍痛转让，接手即可营业。',
      highlights: ['40m²', '设备齐全', '客源稳定', '商铺'],
      details: { area: '40m²', transferFee: '面议', businessType: '奶茶饮品' }
    },
    {
      type: 'houses', tag: '出租', title: '单间公寓出租 拎包入住 450元/月', price: '450元/月',
      address: '舞阳县西大街公寓', contact: '房东老周', phone: '13703950023', publisher: '城东房产小王',
      ownerType: '个人', status: 'pending', viewCount: 0, userId: publishers[1].id, createdAt: daysAgo(0, 1),
      summary: '出租方式：单间出租\n面积：28m²\n独立卫生间，带空调热水器，水电费另计，适合单身上班族。',
      highlights: ['单间出租', '28m²', '独卫', '带空调'],
      details: { area: '28m²', layout: '1室0厅1卫', rentType: '单间出租', payment: '押一付一' }
    },
    // 便民
    {
      type: 'convenience', tag: '拼车', title: '明早7点 舞阳→郑州东站 还剩3座', price: '60元/人',
      address: '舞阳县汽车站集合', contact: '孙师傅', phone: '13703950031', publisher: '热心市民老张',
      status: 'approved', isRecommended: true, viewCount: 87, userId: publishers[2].id, createdAt: daysAgo(0, 8),
      summary: '私家车拼车，明早7点出发去郑州东站，舒适SUV，可带小件行李，全程高速。',
      highlights: ['车找人', '剩3座', '全程高速'],
      details: { targetTime: '明早 7:00 出发', requirement: '提前10分钟到集合点', route: '舞阳 → 郑州东站', seats: 3 }
    },
    {
      type: 'convenience', tag: '失物招领', title: '北湖公园捡到黑色钱包一个 失主速联系', price: '',
      address: '舞阳县北湖公园东门', contact: '环卫刘师傅', phone: '13703950032', publisher: '热心市民老张',
      status: 'approved', viewCount: 64, userId: publishers[2].id, createdAt: daysAgo(1, 2),
      summary: '今天上午在北湖公园东门长椅捡到黑色钱包一个，内有身份证（王某）和银行卡，请失主描述细节后认领。',
      highlights: ['拾物招领', '免费'],
      details: { targetTime: '今日上午拾到', requirement: '描述钱包内物品细节即可认领' }
    },
    {
      type: 'convenience', tag: '打听事', title: '打听一下县医院周六能做核磁吗？', price: '',
      address: '舞阳县人民医院', contact: '小杨', phone: '13703950033', publisher: '青柠用户',
      status: 'approved', viewCount: 41, userId: demoUser.id, createdAt: daysAgo(2, 3),
      summary: '家里老人需要做核磁共振，工作日没时间陪护，想问问县医院周六影像科上班吗？需要提前预约吗？',
      highlights: ['求助咨询'],
      details: { requirement: '知道的朋友麻烦告知，谢谢' }
    },
    {
      type: 'convenience', tag: '便民求助', title: '小区电动车搬上楼 求帮忙 有偿', price: '30元',
      address: '舞阳县幸福里小区3号楼', contact: '吴女士', phone: '13703950034', publisher: '青柠用户',
      status: 'pending', viewCount: 0, userId: demoUser.id, createdAt: daysAgo(0, 1),
      summary: '电梯检修，需要把电动车电池和一些重物搬到6楼，求一位有力气的师傅帮忙，有偿30元。',
      highlights: ['有偿', '今天内'],
      details: { targetTime: '今天 18:00 前', requirement: '能搬重物' }
    },
    // 商家服务
    {
      type: 'yellowPages', tag: '餐饮美食', title: '川香居家常菜馆 承接宴席 可外送', price: '人均35元',
      address: '舞阳县解放路88号', contact: '陈老板', phone: '13703950004', publisher: '川香居老板',
      company: '川香居', ownerType: '企业', status: 'approved', isRecommended: true, viewCount: 268,
      userId: publishers[3].id, createdAt: daysAgo(6),
      summary: '经营川菜家常菜十二年，承接生日宴、满月宴、商务宴请，10人包间3间，支持外卖配送。',
      highlights: ['老店12年', '可订包间', '外送'],
      details: { serviceTime: '10:00-21:30 全年无休', serviceNote: '宴席请提前一天预订' }
    },
    {
      type: 'yellowPages', tag: '维修安装', title: '空调维修加氟 全城上门 30分钟到', price: '上门费20元起',
      address: '舞阳县全城服务', contact: '马师傅', phone: '13703950041', publisher: '热心市民老张',
      ownerType: '个人', status: 'approved', viewCount: 132, userId: publishers[2].id, createdAt: daysAgo(8),
      summary: '专业维修空调、冰箱、洗衣机，加氟清洗保养，全城上门，修不好不收费。',
      highlights: ['全城上门', '修不好不收费'],
      details: { serviceTime: '8:00-20:00', serviceNote: '节假日正常接单' }
    },
    {
      type: 'yellowPages', tag: '家政保洁', title: '金牌月嫂/保洁阿姨 持证上岗', price: '保洁35元/小时',
      address: '舞阳县北京路家政服务中心', contact: '何阿姨', phone: '13703950042', publisher: '川香居老板',
      ownerType: '企业', status: 'pending', viewCount: 0, userId: publishers[3].id, createdAt: daysAgo(0, 3),
      summary: '提供月嫂、育儿嫂、家庭保洁、开荒保洁服务，阿姨均持证上岗，可先面试后签约。',
      highlights: ['持证上岗', '可面试'],
      details: { serviceTime: '全天可约', serviceNote: '月嫂需提前两周预约' }
    },
    // 二手
    {
      type: 'secondhand', tag: '手机数码', title: 'iPhone 14 128G 紫色 95新 自用一年', price: '2800元',
      address: '舞阳县中心广场自提', contact: '小陈', phone: '13703950005', publisher: '数码达人小陈',
      status: 'approved', isRecommended: true, viewCount: 198, userId: publishers[4].id, createdAt: daysAgo(1, 6),
      summary: '自用iPhone 14，128G紫色，电池效率91%，无拆无修无进水，带原装充电头和两个手机壳。',
      highlights: ['95新', '电池91%', '无拆修'],
      details: { condition: '95新', tradeMode: '当面交易', originalPrice: '5999元' }
    },
    {
      type: 'secondhand', tag: '家用电器', title: '美的变频空调1.5匹 搬家急售', price: '900元',
      address: '舞阳县阳光小区', contact: '老刘', phone: '13703950051', publisher: '热心市民老张',
      status: 'approved', viewCount: 88, userId: publishers[2].id, createdAt: daysAgo(2, 8),
      summary: '美的1.5匹变频挂机，用了两年，制冷制热正常，搬家带不走急售，需自行拆装（可推荐师傅）。',
      highlights: ['9成新', '变频', '急售'],
      details: { condition: '9成新', tradeMode: '自提', originalPrice: '2599元' }
    },
    {
      type: 'secondhand', tag: '母婴用品', title: '好孩子婴儿推车 9成新 送凉席', price: '260元',
      address: '舞阳县幸福里小区', contact: '吴女士', phone: '13703950052', publisher: '青柠用户',
      status: 'approved', viewCount: 56, userId: demoUser.id, createdAt: daysAgo(3, 4),
      summary: '好孩子高景观推车，可坐可躺，宝宝大了用不上了，9成新无破损，赠送配套凉席和雨罩。',
      highlights: ['9成新', '送配件'],
      details: { condition: '9成新', tradeMode: '当面交易', originalPrice: '1280元' }
    },
    {
      type: 'secondhand', tag: '家具家居', title: '实木书桌椅一套 低价处理', price: '150元',
      address: '舞阳县西大街', contact: '小陈', phone: '13703950005', publisher: '数码达人小陈',
      status: 'rejected', rejectReason: '图片与描述不符，请补充实拍图后重新提交', viewCount: 12,
      userId: publishers[4].id, createdAt: daysAgo(5),
      summary: '实木书桌一张带椅子，桌面有轻微划痕，不影响使用，自提价150。',
      highlights: ['实木', '自提'],
      details: { condition: '8成新', tradeMode: '自提' }
    },
    // 资讯
    {
      type: 'news', tag: '政务公告', title: '关于县城区部分路段雨污分流改造施工的通告', price: '',
      contact: '县住建局', publisher: '舞阳县住建局', status: 'approved', isTop: true, topPriority: 5,
      topExpireAt: daysAgo(-10), viewCount: 521, createdAt: daysAgo(1),
      summary: '为提升城区排水能力，定于本月15日起对人民路（解放路—北京路段）进行雨污分流改造施工，工期约45天，请过往车辆按交通导改标识绕行。',
      highlights: ['交通管制', '为期45天'],
      details: { source: '舞阳县住建局' }
    },
    {
      type: 'news', tag: '活动预告', title: '本周六北湖广场举办春季招聘会 120家企业参会', price: '',
      contact: '县人社局', publisher: '舞阳县人社局', status: 'approved', isRecommended: true, viewCount: 433, createdAt: daysAgo(2),
      summary: '本周六上午9点，北湖广场举办"春风行动"招聘会，120家企业提供岗位3200个，涵盖制造、服务、电商等行业，求职者携身份证免费入场。',
      highlights: ['免费入场', '3200个岗位'],
      details: { source: '舞阳县人社局' }
    },
    {
      type: 'news', tag: '民生热点', title: '城区新增3处便民充电桩站点 已投入使用', price: '',
      contact: '县发改委', publisher: '舞阳融媒', status: 'approved', viewCount: 287, createdAt: daysAgo(3),
      summary: '为解决电动车充电难问题，城区在幸福里小区、北湖公园、汽车站新增3处充电桩站点，共48个充电位，扫码即可使用。',
      highlights: ['便民设施'],
      details: { source: '舞阳融媒' }
    },
    {
      type: 'news', tag: '生活攻略', title: '春季踏青好去处：北湖湿地公园游玩全攻略', price: '',
      contact: '编辑部', publisher: '舞阳融媒', status: 'approved', viewCount: 198, createdAt: daysAgo(4),
      summary: '北湖湿地公园樱花已进入盛花期，本文整理了停车、观花路线、亲子游乐区和周边美食推荐，收藏这份攻略周末出发。',
      highlights: ['赏花', '亲子'],
      details: { source: '舞阳融媒' }
    }
  ]

  const createdListings = {}
  for (const item of listings) {
    const { highlights, details, ...rest } = item
    const created = await prisma.listing.create({
      data: {
        ...rest,
        highlights: JSON.stringify(highlights || []),
        images: JSON.stringify(item.images || []),
        details: JSON.stringify(details || {}),
        previewToken: Math.random().toString(36).slice(2, 14)
      }
    })
    createdListings[created.title] = created
  }

  // ---------- 互动数据 ----------
  const favListing = createdListings['建业森林半岛 3室2厅 精装修 拎包入住']
  const jobListing = createdListings['诚聘缝纫工 包吃住 月薪5000-8000']
  const phoneListing = createdListings['iPhone 14 128G 紫色 95新 自用一年']

  await prisma.favorite.create({ data: { userId: DEMO_USER_ID, listingId: favListing.id } })
  await prisma.favorite.create({ data: { userId: DEMO_USER_ID, listingId: phoneListing.id } })
  await prisma.application.create({ data: { userId: DEMO_USER_ID, listingId: jobListing.id } })
  await prisma.viewRecord.create({ data: { userId: DEMO_USER_ID, listingId: favListing.id } })
  await prisma.viewRecord.create({ data: { userId: DEMO_USER_ID, listingId: jobListing.id } })
  await prisma.viewRecord.create({ data: { userId: DEMO_USER_ID, listingId: phoneListing.id } })

  await prisma.message.create({
    data: { userId: DEMO_USER_ID, title: '欢迎使用青柠本地生活', desc: '在这里可以找工作、找房子、发布便民信息，点击「发布」立即体验。', unread: true, createdAt: daysAgo(3) }
  })
  await prisma.message.create({
    data: { userId: DEMO_USER_ID, title: '发布成功，等待审核', desc: '您发布的「小区电动车搬上楼 求帮忙 有偿」已提交，审核通过后将自动展示。', unread: true }
  })

  // ---------- 举报 / 认证 ----------
  await prisma.report.create({
    data: {
      targetId: createdListings['实木书桌椅一套 低价处理'].id,
      targetTitle: '实木书桌椅一套 低价处理',
      reason: '图片与实物不符，疑似虚假信息',
      reporter: '青柠用户',
      userId: DEMO_USER_ID,
      status: 'pending',
      createdAt: daysAgo(1)
    }
  })
  await prisma.report.create({
    data: {
      targetId: jobListing.id,
      targetTitle: '诚聘缝纫工 包吃住 月薪5000-8000',
      reason: '电话打不通',
      reporter: '热心市民老张',
      status: 'handled',
      result: '已核实联系方式有效，举报不成立',
      createdAt: daysAgo(4)
    }
  })

  await prisma.certification.create({
    data: { applicant: '舞阳衣尚服饰有限公司', type: '企业认证', phone: '13703950001', material: '营业执照编号：9141xxxxxxxx', status: 'pending', createdAt: daysAgo(1) }
  })
  await prisma.certification.create({
    data: { applicant: '城东房产小王', type: '中介认证', phone: '13703950002', material: '中介资质证书：豫房中字第xxxx号', status: 'approved', createdAt: daysAgo(10) }
  })
  await prisma.certification.create({
    data: { applicant: '青柠用户', type: '个人实名', phone: '13800000000', material: '身份证：4111**********0012', status: 'pending', createdAt: daysAgo(0, 6) }
  })

  // ---------- 广告位 ----------
  const homePosition = await prisma.adPosition.create({
    data: { name: '首页轮播', scene: 'home', pv: 12860, uv: 4210 }
  })
  await prisma.ad.create({
    data: { positionId: homePosition.id, title: '本地好工作 快人一步', desc: '优质岗位每日更新', image: '/uploads/seed-banner-1.svg', linkType: 'category', linkValue: 'jobs', status: 'enabled', clickCount: 386 }
  })
  await prisma.ad.create({
    data: { positionId: homePosition.id, title: '安心找房 一站直达', desc: '真实房源 在线直联房东', image: '/uploads/seed-banner-2.svg', linkType: 'category', linkValue: 'houses', status: 'enabled', clickCount: 254 }
  })
  await prisma.ad.create({
    data: { positionId: homePosition.id, title: '闲置流转 绿色生活', desc: '二手好物 同城自提', image: '/uploads/seed-banner-3.svg', linkType: 'category', linkValue: 'secondhand', status: 'enabled', clickCount: 199 }
  })
  await prisma.adPosition.create({ data: { name: '首页精选插位', scene: 'home_featured', pv: 8230, uv: 3105 } })
  await prisma.adPosition.create({ data: { name: '招聘频道横幅', scene: 'jobs_channel', pv: 5120, uv: 1980 } })

  // ---------- 置顶订单 ----------
  await prisma.topOrder.create({
    data: { targetId: jobListing.id, targetTitle: jobListing.title, buyer: '舞阳人力资源', amount: '30', status: 'paid', startedAt: daysAgo(1), expiredAt: daysAgo(-6), createdAt: daysAgo(1) }
  })
  await prisma.topOrder.create({
    data: { targetId: favListing.id, targetTitle: favListing.title, buyer: '城东房产小王', amount: '50', status: 'paid', startedAt: daysAgo(3), expiredAt: daysAgo(-4), createdAt: daysAgo(3) }
  })
  await prisma.topOrder.create({
    data: { targetId: phoneListing.id, targetTitle: phoneListing.title, buyer: '数码达人小陈', amount: '10', status: 'expired', startedAt: daysAgo(12), expiredAt: daysAgo(5), createdAt: daysAgo(12) }
  })

  // ---------- 敏感词 / 公告 / 配置 ----------
  for (const word of ['代开发票', '赌博', '高利贷', '刷单', '彩票代购']) {
    await prisma.sensitiveWord.create({ data: { word } })
  }
  await prisma.notice.create({
    data: { title: '平台信息发布规范', content: '发布信息需真实有效，严禁发布违法违规内容，违者封禁账号。', status: 'enabled', createdAt: daysAgo(7) }
  })
  await prisma.notice.create({
    data: { title: '春季招聘会公告', content: '本周六北湖广场春季招聘会，120家企业参会，欢迎求职者参加。', status: 'enabled', createdAt: daysAgo(2) }
  })

  const settings = {
    appName: '青柠本地生活',
    city: '舞阳',
    customerServicePhone: '0395-7654321',
    customerWechat: 'qingning-service',
    auditRequiredTypes: ['jobs', 'houses', 'convenience', 'yellowPages', 'secondhand'],
    sensitiveStrategy: 'manual',
    newUserPublishDelayHours: 0,
    userAgreement: '欢迎使用青柠本地生活平台。用户发布信息应真实、合法，平台对违规信息有权下架并追究责任。',
    privacyPolicy: '我们仅在提供服务所必需的范围内收集和使用您的信息，不会向第三方出售您的个人数据。',
    aboutUs: '青柠本地生活：聚合招聘、房源、便民、商家服务、二手与本地资讯的同城信息服务平台。'
  }
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.create({ data: { key, value: JSON.stringify(value) } })
  }

  // ---------- 操作日志 ----------
  const logSeeds = [
    { operator: '超级管理员', action: '审核通过', target: '房源：建业森林半岛 3室2厅', createdAt: daysAgo(3) },
    { operator: '审核员小李', action: '审核通过', target: '招聘：诚聘缝纫工 包吃住', createdAt: daysAgo(1) },
    { operator: '审核员小李', action: '审核拒绝', target: '二手：实木书桌椅一套', createdAt: daysAgo(1, 2) },
    { operator: '超级管理员', action: '设置置顶', target: '招聘：诚聘缝纫工 包吃住', createdAt: daysAgo(1, 1) },
    { operator: '超级管理员', action: '发布公告', target: '平台信息发布规范', createdAt: daysAgo(7) }
  ]
  for (const log of logSeeds) {
    await prisma.operationLog.create({ data: log })
  }

  console.log('seed: 初始化完成。管理员 admin / change_me_please，审核员 auditor / auditor123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
