<template>
  <view class="app-page category-page" :class="{ 'category-page--jobs': isJobsPage, 'category-page--houses': isHousesPage }">
    <view v-if="isJobsPage" class="jobs-shell">
      <view class="jobs-nav">
        <view class="jobs-nav-back tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#10233F" size="42rpx" />
        </view>
        <text class="jobs-nav-title">求职招聘</text>
      </view>

      <view class="jobs-top">
        <view class="jobs-search tap" @tap="goSearch">
          <text class="jobs-search-city">漯河·舞阳县人民...</text>
          <text class="jobs-search-arrow">▾</text>
          <text class="jobs-search-line"></text>
          <text class="jobs-search-keyword">司机</text>
          <AppIcon name="lucide:search" color="#10233F" size="38rpx" />
        </view>

        <view class="jobs-panel">
          <view class="jobs-panel-tabs">
            <view
              v-for="tab in jobRecommendTabs"
              :key="tab"
              class="jobs-panel-tab tap"
              :class="{ active: jobActiveRecommend === tab }"
              @tap="setJobRecommendTab(tab)"
          >
            {{ tab }}
          </view>
        </view>
      </view>
    </view>

      <view class="job-toolbar">
        <view class="job-sort">
          <view
            v-for="item in jobSorts"
            :key="item.value"
            class="job-sort-item tap"
            :class="{ active: sortMode === item.value }"
            @tap="setSortMode(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
        <view class="job-filter-actions">
          <view class="job-filter-button tap" @tap="openFilter">
            <text class="job-filter-symbol">≡</text>
            <text>筛选</text>
          </view>
          <text class="job-filter-divider"></text>
          <view class="job-reset-button tap" @tap="resetFilters">
            <text class="job-reset-symbol">↻</text>
            <text>重置</text>
          </view>
        </view>
      </view>

      <view v-if="jobList.length" class="job-list">
        <view v-for="job in jobList" :key="job.id" class="job-card tap" @tap="openJobDetail(job)">
          <view class="job-card-head">
            <text class="job-title">{{ job.title }}</text>
            <text class="job-salary">{{ job.price }}</text>
          </view>
          <view class="job-tags">
            <text v-for="chip in jobChips(job)" :key="chip" class="job-tag">{{ chip }}</text>
          </view>
          <view class="job-card-bottom">
            <view class="job-company-logo">{{ jobCompanyInitial(job) }}</view>
            <view class="job-company-main">
              <view class="job-company-line">
                <text class="job-company-name">{{ jobCompanyName(job) }}</text>
                <text class="job-verify">✓ 企业验真</text>
              </view>
              <text class="job-address">{{ jobDisplayAddress(job) }}</text>
            </view>
            <view class="job-apply tap" @tap.stop="applyJobNow(job)">立即报名</view>
          </view>
        </view>
      </view>
      <view v-else class="empty card">
        <text class="empty-title">暂无匹配岗位</text>
        <text class="empty-desc">换个筛选条件看看，或者先发布一条招聘信息。</text>
        <view class="primary-btn tap" @tap="goPublish">去发布</view>
      </view>

      <view v-if="filterVisible" class="filter-mask" @tap="closeFilter">
        <view class="filter-sheet" @tap.stop>
          <view class="filter-head">
            <text class="filter-title">筛选</text>
            <view class="filter-close tap" @tap="closeFilter">×</view>
          </view>
          <view class="filter-body">
            <view class="filter-left">
              <view
                v-for="item in jobFilterTabs"
                :key="item.key"
                class="filter-left-item tap"
                :class="{ active: activeFilterTab === item.key }"
                @tap="setActiveFilterTab(item.key)"
              >
                {{ item.label }}
              </view>
            </view>

            <view v-if="activeFilterTab !== 'type'" class="filter-options">
              <view
                v-for="option in activeFilterOptions"
                :key="option"
                class="filter-option tap"
                :class="{ active: isFilterOptionActive(option) }"
                @tap="selectFilterOption(option)"
              >
                {{ option }}
              </view>
            </view>

            <view v-else class="filter-type">
              <scroll-view class="filter-type-groups" scroll-y>
                <view
                  v-for="group in jobTypeGroups"
                  :key="group.name"
                  class="filter-type-group tap"
                  :class="{ active: draftFilters.category === group.name }"
                  @tap="selectJobTypeGroup(group.name)"
                >
                  {{ group.name }}
                </view>
              </scroll-view>
              <view class="filter-type-options">
                <view
                  v-for="option in activeJobTypeOptions"
                  :key="option"
                  class="filter-option tap"
                  :class="{ active: isJobTypeOptionActive(option) }"
                  @tap="selectFilterOption(option)"
                >
                  {{ option }}
                </view>
              </view>
            </view>
          </view>
          <view class="filter-footer">
            <view class="filter-reset tap" @tap="resetDraftFilters">
              <text class="job-reset-symbol">↻</text>
              <text>重置</text>
            </view>
            <view class="filter-confirm tap" @tap="applyFilters">确定</view>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="isHousesPage" class="house-shell">
      <view class="house-top">
        <view class="house-nav">
          <view class="house-back tap" @tap="goBack">
            <AppIcon name="lucide:chevron-left" color="#111827" size="42rpx" />
          </view>
          <text class="house-brand">房源</text>
        </view>
        <view class="house-search tap" @tap="goHouseSearch">
          <AppIcon name="lucide:search" color="#8a94a6" size="34rpx" />
          <text class="house-search-text">请输入小区或商圈</text>
        </view>
        <scroll-view class="house-tabs" scroll-x>
          <view class="house-tab-row">
            <view
              v-for="tab in houseTabs"
              :key="tab"
              class="house-tab tap"
              :class="{ active: houseActiveTab === tab }"
              @tap="switchHouseTab(tab)"
            >
              {{ tab }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="showHouseRentList" class="house-rent-list">
        <view v-for="item in houseDisplayList" :key="item.id" class="house-rent-card tap" @tap="openHouseDetail(item)">
          <view class="house-rent-cover">
            <image v-if="houseCover(item)" class="house-rent-image" :src="houseCover(item)" mode="aspectFill" />
            <view v-else class="house-cover-fallback">
              <AppIcon name="lucide:house" color="#FFFFFF" size="56rpx" />
            </view>
          </view>
          <view class="house-rent-main">
            <text class="house-rent-title">{{ houseRentTitle(item) }}</text>
            <text class="house-rent-meta">{{ houseRentMeta(item) }}</text>
            <view class="house-rent-tags">
              <text v-for="tag in houseCardTags(item)" :key="tag" class="house-rent-tag">{{ tag }}</text>
            </view>
            <text class="house-rent-price">{{ houseRentPrice(item) }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="houseDisplayList.length" class="house-sale-grid">
        <view v-for="item in houseDisplayList" :key="item.id" class="house-sale-card tap" @tap="openHouseDetail(item)">
          <view class="house-sale-cover">
            <image v-if="houseCover(item)" class="house-sale-image" :src="houseCover(item)" mode="aspectFill" />
            <view v-else class="house-cover-fallback">
              <AppIcon name="lucide:house" color="#FFFFFF" size="58rpx" />
            </view>
            <text class="house-sale-location">{{ houseCommunity(item) }}</text>
          </view>
          <view class="house-sale-body">
            <text class="house-sale-title">{{ item.title }}</text>
            <text class="house-sale-meta">{{ houseSaleMeta(item) }}</text>
            <view class="house-sale-price-row">
              <text class="house-sale-price">{{ houseSalePrice(item) }}</text>
              <text class="house-sale-unit">{{ houseUnitPrice(item) }}</text>
            </view>
            <view class="house-sale-tags">
              <text v-for="tag in houseCardTags(item)" :key="tag" class="house-sale-tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty card">
        <text class="empty-title">暂无匹配房源</text>
        <text class="empty-desc">换个房源类型看看，或者先发布一条房源信息。</text>
        <view class="primary-btn tap" @tap="goPublish">去发布</view>
      </view>
    </view>

    <view v-else class="category-standard">
      <view class="category-hero">
        <AppHeader :title="meta.title" :subtitle="meta.subtitle" back>
          <view v-if="currentType !== 'news'" class="publish-mini tap" @tap="goPublish">发布</view>
        </AppHeader>

        <view class="summary-card">
          <view>
            <text class="summary-title">共 {{ filteredList.length }} 条本地信息</text>
            <text class="summary-desc">精选附近高频信息，按发布时间实时更新</text>
          </view>
          <view class="summary-icon">
            <AppIcon :name="categoryIcon" color="#FFFFFF" size="50rpx" />
          </view>
        </view>
      </view>

      <scroll-view class="tabs" scroll-x>
        <view class="tab-row">
          <view
            v-for="tab in meta.tabs"
            :key="tab"
            class="tab tap"
            :class="{ active: activeTab === tab }"
            @tap="switchTab(tab)"
          >
            {{ tab }}
          </view>
        </view>
      </scroll-view>

      <view v-if="meta.filters.length" class="filters">
        <view v-for="filter in meta.filters" :key="filter" class="filter tap">{{ filter }}</view>
      </view>

      <view v-if="isSecondhandPage && filteredList.length" class="secondhand-waterfall">
        <view class="secondhand-column">
          <view v-for="item in secondhandLeftList" :key="item.id" class="secondhand-card tap" @tap="openStandardDetail(item)">
            <view class="secondhand-cover" :class="item.waterfallClass">
              <image v-if="item.firstImage" class="secondhand-image" :src="item.firstImage" mode="aspectFill" />
              <view v-else class="secondhand-cover-empty">
                <AppIcon name="lucide:secondhand-clothes" color="#FFFFFF" size="60rpx" />
              </view>
            </view>
            <view class="secondhand-body">
              <text class="secondhand-title">{{ item.title }}</text>
              <text class="secondhand-time">{{ secondhandTimeText(item) }}</text>
              <view class="secondhand-price-row">
                <text class="secondhand-price">{{ secondhandPriceText(item) }}</text>
                <text class="secondhand-want">{{ secondhandWantText(item) }}</text>
              </view>
              <view class="secondhand-seller-row">
                <view class="secondhand-avatar">{{ standardLogoText(item) }}</view>
                <text class="secondhand-seller">{{ standardContactText(item) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="secondhand-column">
          <view v-for="item in secondhandRightList" :key="item.id" class="secondhand-card tap" @tap="openStandardDetail(item)">
            <view class="secondhand-cover" :class="item.waterfallClass">
              <image v-if="item.firstImage" class="secondhand-image" :src="item.firstImage" mode="aspectFill" />
              <view v-else class="secondhand-cover-empty">
                <AppIcon name="lucide:secondhand-clothes" color="#FFFFFF" size="60rpx" />
              </view>
            </view>
            <view class="secondhand-body">
              <text class="secondhand-title">{{ item.title }}</text>
              <text class="secondhand-time">{{ secondhandTimeText(item) }}</text>
              <view class="secondhand-price-row">
                <text class="secondhand-price">{{ secondhandPriceText(item) }}</text>
                <text class="secondhand-want">{{ secondhandWantText(item) }}</text>
              </view>
              <view class="secondhand-seller-row">
                <view class="secondhand-avatar">{{ standardLogoText(item) }}</view>
                <text class="secondhand-seller">{{ standardContactText(item) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else-if="filteredList.length" class="standard-list">
        <view v-for="item in filteredList" :key="item.id" class="standard-card tap" @tap="openStandardDetail(item)">
          <view class="standard-card-head">
            <text class="standard-title">{{ item.title }}</text>
            <text class="standard-side">{{ standardSideText(item) }}</text>
          </view>
          <text class="standard-summary">{{ item.summary }}</text>
          <view class="standard-tags">
            <text v-for="chip in standardChips(item)" :key="chip" class="standard-tag">{{ chip }}</text>
          </view>
          <view class="standard-card-bottom">
            <view class="standard-logo">{{ standardLogoText(item) }}</view>
            <view class="standard-main">
              <view class="standard-line">
                <text class="standard-name">{{ standardContactText(item) }}</text>
                <text class="standard-verify">{{ meta.title }}</text>
              </view>
              <text class="standard-address">{{ standardAddressText(item) }}</text>
            </view>
            <view class="standard-action tap" @tap.stop="openStandardDetail(item)">{{ standardActionText }}</view>
          </view>
        </view>
      </view>
      <view v-else class="empty card">
        <text class="empty-title">暂无匹配信息</text>
        <text class="empty-desc">换个分类看看，或者先发布一条本地信息。</text>
        <view class="primary-btn tap" @tap="goPublish">去发布</view>
      </view>
    </view>
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import { getCategories, getListings } from '../../utils/api'
import { categoryMeta, serviceCategories as defaultCategories } from '../../data/catalog'

function createDefaultJobFilters() {
  return {
    area: '不限',
    settlement: '不限',
    type: '不限',
    category: '在线课程'
  }
}

const jobAreas = ['舞阳县', '源汇区', '郾城区', '召陵区', '临颍县']
const fallbackHouseList = [
  {
    id: 'house-sale-demo-1',
    type: 'houses',
    title: '建业城 精装三室 南北通透 采光好',
    tag: '出售',
    price: '68万元',
    address: '舞阳县 建业城',
    contact: '周经理',
    phone: '13800138013',
    summary: '小区：建业城\n面积：118m²\n户型：3室2厅2卫\n楼层：中层 / 共18层\n朝向：南北\n装修：精装修\n房屋类型：普通住宅',
    highlights: ['118m²', '3室2厅2卫', '南北', '精装修'],
    images: []
  },
  {
    id: 'house-sale-demo-2',
    type: 'houses',
    title: '中心城区两室一厅 满五唯一 诚心出售',
    tag: '出售',
    price: '46万元',
    address: '舞阳县 中心城区',
    contact: '李女士',
    phone: '13800138012',
    summary: '小区：中心花园\n面积：89m²\n户型：2室1厅1卫\n楼层：低层 / 共6层\n朝向：南\n装修：简单装修\n房屋类型：普通住宅',
    highlights: ['89m²', '2室1厅1卫', '南', '满五'],
    images: []
  },
  {
    id: 'house-rent-demo-1',
    type: 'houses',
    title: '建业城 整套出租 拎包入住',
    tag: '整套出租',
    price: '1300元/月',
    address: '漯河 建业城',
    contact: '刘女士',
    phone: '13800138011',
    summary: '出租方式：整套出租\n城市：漯河\n小区：建业城\n面积：92m²\n户型：2室2厅1卫\n朝向：南\n入住时间：随时入住\n付款方式：押一付三\n楼层：8层 / 总18层\n看房时间：提前预约\n费用包含：物业费\n房东身份：个人房东\n房源标签：拎包入住、家电齐全',
    highlights: ['整套出租', '92m²', '2室2厅1卫', '南', '押一付三', '拎包入住'],
    images: []
  }
]

export default {
  components: { AppHeader, AppIcon },
  data() {
    return {
      currentType: 'jobs',
      activeTab: '全部',
      sourceList: [],
      serviceCategories: defaultCategories,
      jobRecommendTabs: ['推荐'],
      jobActiveRecommend: '推荐',
      jobSorts: [
        { label: '默认', value: 'default' },
        { label: '附近', value: 'near' },
        { label: '最新', value: 'new' }
      ],
      sortMode: 'default',
      filterVisible: false,
      activeFilterTab: 'area',
      jobFilters: createDefaultJobFilters(),
      draftFilters: createDefaultJobFilters(),
      jobFilterTabs: [
        { label: '工作区域', key: 'area' },
        { label: '结算方式', key: 'settlement' },
        { label: '职位类型', key: 'type' }
      ],
      jobFilterOptions: {
        area: ['不限', '源汇区', '郾城区', '召陵区', '舞阳县', '临颍县'],
        settlement: ['不限', '日结', '周结', '月结', '完工结算', '面议']
      },
      jobTypeGroups: [
        { name: '在线课程', options: ['全部', '设计创作', '视频制作', '才艺技能兼职', '语言留学', '职业考证', '兴趣生活'] },
        { name: '主播艺人', options: ['全部', '主播', '演员', '模特', '配音'] },
        { name: '餐饮服务', options: ['全部', '服务员', '后厨', '洗碗工', '咖啡师'] },
        { name: '超市零售', options: ['全部', '店员', '收银员', '理货员', '导购'] },
        { name: '骑手/配送', options: ['全部', '外卖骑手', '同城配送', '快递员'] },
        { name: '文员/助理', options: ['全部', '文员', '行政', '客服', '数据录入'] },
        { name: '教育/培训', options: ['全部', '家教', '助教', '课程顾问'] },
        { name: '市场推广', options: ['全部', '地推', '促销', '问卷', '活动执行'] }
      ],
      houseTabs: ['推荐', '二手房', '租房'],
      houseActiveTab: '二手房'
    }
  },
  computed: {
    isJobsPage() {
      return this.currentType === 'jobs'
    },
    isHousesPage() {
      return this.currentType === 'houses'
    },
    isSecondhandPage() {
      return this.currentType === 'secondhand'
    },
    currentCategory() {
      return this.serviceCategories.find((item) => item.type === this.currentType)
    },
    meta() {
      const base = categoryMeta[this.currentType] || categoryMeta.jobs
      const tabs = this.currentCategory && this.currentCategory.tabs && this.currentCategory.tabs.length
        ? ['全部', ...this.currentCategory.tabs]
        : base.tabs
      return { ...base, tabs }
    },
    categoryIcon() {
      return this.currentCategory && this.currentCategory.icon ? this.currentCategory.icon : 'lucide:map-pin'
    },
    filteredList() {
      if (this.activeTab === '全部') return this.sourceList
      return this.sourceList.filter((item) => item.tag === this.activeTab)
    },
    activeFilterOptions() {
      return this.jobFilterOptions[this.activeFilterTab] || []
    },
    activeJobTypeGroup() {
      const matched = this.jobTypeGroups.find((item) => item.name === this.draftFilters.category)
      return matched || this.jobTypeGroups[0]
    },
    activeJobTypeOptions() {
      return this.activeJobTypeGroup ? this.activeJobTypeGroup.options : []
    },
    jobList() {
      let list = this.filteredList.slice()
      const filters = this.jobFilters
      if (filters.area !== '不限') {
        list = list.filter((item) => this.jobSearchText(item).indexOf(filters.area) !== -1)
      }
      if (filters.settlement !== '不限') {
        list = list.filter((item) => this.jobSearchText(item).indexOf(filters.settlement) !== -1)
      }
      if (filters.type !== '不限') {
        list = list.filter((item) => this.jobSearchText(item).indexOf(filters.type) !== -1)
      }
      if (this.sortMode === 'near') {
        list.sort((a, b) => this.nearScore(b) - this.nearScore(a))
      }
      if (this.sortMode === 'new') {
        list = list.reverse()
      }
      return list
    },
    houseSourceList() {
      return this.sourceList.length ? this.sourceList : fallbackHouseList
    },
    houseDisplayList() {
      const list = this.houseSourceList.slice()
      if (this.houseActiveTab === '租房') return list.filter((item) => this.isRentHouse(item))
      if (this.houseActiveTab === '二手房') return list.filter((item) => this.isSaleHouse(item))
      if (this.houseActiveTab === '商业地产') return list.filter((item) => this.houseSearchText(item).indexOf('商铺') !== -1)
      if (this.houseActiveTab === '新房') return list.filter((item) => this.houseSearchText(item).indexOf('新房') !== -1)
      if (this.houseActiveTab === '装修') return list.filter((item) => this.houseSearchText(item).indexOf('装修') !== -1)
      return list
    },
    showHouseRentList() {
      return this.houseActiveTab === '租房' && this.houseDisplayList.length > 0
    },
    secondhandList() {
      return this.filteredList.map((item, index) => ({
        ...item,
        firstImage: this.firstImage(item),
        waterfallClass: index % 3 === 1 ? 'secondhand-cover--tall' : 'secondhand-cover--normal'
      }))
    },
    secondhandLeftList() {
      return this.secondhandList.filter((item, index) => index % 2 === 0)
    },
    secondhandRightList() {
      return this.secondhandList.filter((item, index) => index % 2 === 1)
    },
    standardActionText() {
      return this.currentType === 'news' ? '查看' : '联系'
    }
  },
  async onLoad(query) {
    if (query && query.type && categoryMeta[query.type]) this.currentType = query.type
    await this.loadCategories()
    this.activeTab = '全部'
    await this.loadList()
  },
  methods: {
    setJobRecommendTab(tab) {
      this.jobActiveRecommend = tab
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    setSortMode(mode) {
      this.sortMode = mode
    },
    switchHouseTab(tab) {
      this.houseActiveTab = tab
    },
    openFilter() {
      this.draftFilters = { ...this.jobFilters }
      this.activeFilterTab = this.activeFilterTab || 'area'
      this.filterVisible = true
    },
    closeFilter() {
      this.filterVisible = false
    },
    setActiveFilterTab(key) {
      this.activeFilterTab = key
    },
    selectFilterOption(option) {
      if (this.activeFilterTab === 'type') {
        this.draftFilters.type = option === '全部' ? '不限' : option
        return
      }
      this.draftFilters[this.activeFilterTab] = option
    },
    isFilterOptionActive(option) {
      return this.draftFilters[this.activeFilterTab] === option
    },
    isJobTypeOptionActive(option) {
      return option === '全部' ? this.draftFilters.type === '不限' : this.draftFilters.type === option
    },
    selectJobTypeGroup(name) {
      this.draftFilters.category = name
      this.draftFilters.type = '不限'
    },
    resetDraftFilters() {
      this.draftFilters = createDefaultJobFilters()
    },
    resetFilters() {
      this.jobFilters = createDefaultJobFilters()
      this.draftFilters = createDefaultJobFilters()
      this.sortMode = 'default'
    },
    applyFilters() {
      this.jobFilters = { ...this.draftFilters }
      this.filterVisible = false
    },
    goSearch() {
      uni.navigateTo({ url: '/pages/search/index?type=jobs' })
    },
    goHouseSearch() {
      uni.navigateTo({ url: '/pages/search/index?type=houses' })
    },
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/home/index' })
    },
    openJobDetail(job) {
      const preview = job.previewToken ? `&previewToken=${encodeURIComponent(job.previewToken)}` : ''
      uni.navigateTo({ url: `/pages/detail/index?type=jobs&id=${job.id}${preview}` })
    },
    applyJobNow(job) {
      uni.navigateTo({ url: `/pages/detail/index?type=jobs&id=${job.id}` })
    },
    openStandardDetail(item) {
      if (!item || !item.id) return
      const preview = item.previewToken ? `&previewToken=${encodeURIComponent(item.previewToken)}` : ''
      uni.navigateTo({ url: `/pages/detail/index?type=${this.currentType}&id=${encodeURIComponent(item.id)}${preview}` })
    },
    firstImage(item) {
      return item && Array.isArray(item.images) && item.images.length ? item.images[0] : ''
    },
    standardChips(item) {
      const chips = item && Array.isArray(item.highlights) ? item.highlights.slice() : []
      if (item && item.tag) chips.unshift(item.tag)
      return this.uniqueList(chips).slice(0, 4)
    },
    standardSideText(item) {
      if (!item) return ''
      if (this.currentType === 'news') return item.tag || '资讯'
      return item.price || item.tag || '面议'
    },
    standardLogoText(item) {
      const text = this.standardContactText(item)
      return text ? text.slice(0, 1) : '本'
    },
    standardContactText(item) {
      if (!item) return '本地用户'
      return item.contact || item.author || item.source || '本地用户'
    },
    standardAddressText(item) {
      if (!item) return '本地'
      const address = item.address || '本地'
      return item.time ? `${address} · ${item.time}` : address
    },
    secondhandTimeText(item) {
      return item && item.time ? item.time : '72小时内发布'
    },
    secondhandPriceText(item) {
      return item && item.price ? item.price : '价格面议'
    },
    secondhandWantText(item) {
      const raw = item && (item.wantCount || item.viewCount || item.views)
      const count = Number(raw) > 0 ? Number(raw) : 1
      return `${count}人想要`
    },
    openHouseDetail(item) {
      if (!item || !item.id) return
      uni.setStorageSync('housePreviewItem', item)
      const preview = item.previewToken ? `&previewToken=${encodeURIComponent(item.previewToken)}` : ''
      uni.navigateTo({ url: `/pages/detail/index?type=houses&id=${encodeURIComponent(item.id)}${preview}` })
    },
    jobChips(job) {
      const chips = Array.isArray(job.highlights) ? job.highlights.slice(0, 4) : []
      if (!chips.length && job.tag) chips.push(job.tag)
      return chips
    },
    jobCompanyName(job) {
      return job.contact || '本地招聘企业'
    },
    jobCompanyInitial(job) {
      const name = this.jobCompanyName(job)
      return name ? name.slice(0, 1) : '企'
    },
    jobDisplayAddress(job) {
      const address = job && job.address ? String(job.address).trim() : '本地'
      const matchedArea = jobAreas.find((area) => address.indexOf(area) === 0)
      if (matchedArea) {
        const detail = address.slice(matchedArea.length).trim()
        return detail ? `${matchedArea} ${detail}` : matchedArea
      }
      const area = this.jobFilters.area !== '不限' ? this.jobFilters.area : '舞阳县'
      return `${area} ${address}`
    },
    jobSearchText(job) {
      const chips = Array.isArray(job.highlights) ? job.highlights.join(' ') : ''
      return `${job.title || ''} ${job.tag || ''} ${job.summary || ''} ${job.address || ''} ${job.price || ''} ${chips}`
    },
    nearScore(job) {
      const text = this.jobSearchText(job)
      if (text.indexOf('舞阳') !== -1) return 3
      if (text.indexOf('漯河') !== -1) return 2
      return 1
    },
    isRentHouse(item) {
      const text = this.houseSearchText(item)
      return text.indexOf('租') !== -1 || text.indexOf('元/月') !== -1 || text.indexOf('出租方式') !== -1
    },
    isSaleHouse(item) {
      const text = this.houseSearchText(item)
      return text.indexOf('售') !== -1 || text.indexOf('万元') !== -1 || text.indexOf('万') !== -1
    },
    houseSearchText(item) {
      if (!item) return ''
      const chips = Array.isArray(item.highlights) ? item.highlights.join(' ') : ''
      return `${item.title || ''} ${item.tag || ''} ${item.summary || ''} ${item.address || ''} ${item.price || ''} ${chips}`
    },
    houseSummaryMap(item) {
      const map = {}
      const summary = item && item.summary ? String(item.summary) : ''
      summary.split(/\n|；|;/).forEach((line) => {
        const parts = line.split(/[:：]/)
        if (parts.length < 2) return
        const key = parts.shift().trim()
        const value = parts.join('：').trim()
        if (key && value) map[key] = value
      })
      return map
    },
    houseField(item, keys, fallback) {
      const map = this.houseSummaryMap(item)
      for (let index = 0; index < keys.length; index += 1) {
        const value = map[keys[index]]
        if (value) return value
      }
      return fallback || ''
    },
    houseHighlight(item, keyword) {
      const highlights = item && Array.isArray(item.highlights) ? item.highlights : []
      return highlights.find((entry) => String(entry).indexOf(keyword) !== -1) || ''
    },
    houseCover(item) {
      return item && Array.isArray(item.images) && item.images.length ? item.images[0] : ''
    },
    houseCommunity(item) {
      const community = this.houseField(item, ['小区'], '')
      if (community) return community
      const address = item && item.address ? String(item.address).replace(/^漯河\s*/, '').replace(/^舞阳县\s*/, '') : ''
      return address || '本地小区'
    },
    houseArea(item) {
      return this.houseField(item, ['面积'], this.houseHighlight(item, 'm') || '面积面议')
    },
    houseLayout(item) {
      return this.houseField(item, ['户型'], this.houseHighlight(item, '室') || '户型待定')
    },
    houseFloor(item) {
      return this.houseField(item, ['楼层'], '楼层待定')
    },
    houseOrientation(item) {
      return this.houseField(item, ['朝向'], this.houseHighlight(item, '南') || '朝向待定')
    },
    houseDecoration(item) {
      return this.houseField(item, ['装修'], this.houseHighlight(item, '装修') || '装修待定')
    },
    houseRentTitle(item) {
      return `${item.tag || '整租'} · ${this.houseCommunity(item)}`
    },
    houseRentMeta(item) {
      return `${this.houseLayout(item)} | ${this.houseArea(item)} | ${this.houseCommunity(item)}`
    },
    houseSaleMeta(item) {
      return `${this.houseLayout(item)} / ${this.houseArea(item)} / ${this.houseOrientation(item)}`
    },
    houseRentPrice(item) {
      return item && item.price ? item.price : '租金面议'
    },
    houseSalePrice(item) {
      const price = item && item.price ? String(item.price) : ''
      if (!price) return '总价面议'
      if (price.indexOf('万元') !== -1 || price.indexOf('万') !== -1) return price
      return `${price}万`
    },
    houseUnitPrice(item) {
      const price = item && item.price ? String(item.price) : ''
      const areaText = this.houseArea(item)
      const priceMatch = price.match(/(\d+(\.\d+)?)/)
      const areaMatch = areaText.match(/(\d+(\.\d+)?)/)
      if (priceMatch && areaMatch) {
        const unit = Math.round((Number(priceMatch[1]) * 10000) / Number(areaMatch[1]))
        if (unit > 0) return `${unit}元/㎡`
      }
      return '单价面议'
    },
    houseCardTags(item) {
      const tags = item && Array.isArray(item.highlights) ? item.highlights.slice() : []
      if (item && item.tag) tags.unshift(item.tag)
      return this.uniqueList(tags).filter((tag) => tag.length <= 8).slice(0, 3)
    },
    uniqueList(source) {
      return source
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item, index, list) => item && list.indexOf(item) === index)
    },
    async loadList() {
      this.sourceList = []
      try {
        const data = await getListings({ type: this.currentType, pageSize: 100 })
        this.sourceList = data.items || []
      } catch {
        return
      }
    },
    async loadCategories() {
      try {
        const data = await getCategories()
        this.serviceCategories = data && data.length ? data : this.serviceCategories
      } catch {
        return
      }
    },
    goPublish() {
      if (this.currentType === 'news') {
        uni.showToast({ title: '资讯由后台发布', icon: 'none' })
        return
      }
      uni.reLaunch({ url: `/pages/publish/index?type=${this.currentType}` })
    }
  }
}
</script>

<style scoped>
.category-page--houses {
  overflow-x: hidden;
  padding: 0 18rpx 140rpx;
  background: #f5f6f8;
}

.house-shell {
  min-height: 100vh;
  padding-top: calc(266rpx + env(safe-area-inset-top));
}

.house-top {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  padding: calc(14rpx + env(safe-area-inset-top)) 18rpx 30rpx;
  background: linear-gradient(180deg, #c7f7e1 0%, #f5f6f8 100%);
}

.house-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70rpx;
}

.house-back {
  position: absolute;
  left: 0;
  top: 2rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.house-brand {
  color: #111827;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.house-search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: 72rpx;
  margin-top: 12rpx;
  padding: 0 22rpx;
  border-radius: 15rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 22rpx rgba(31, 197, 111, 0.12);
}

.house-search-text {
  color: #8a94a6;
  font-size: 26rpx;
  line-height: 72rpx;
}

.house-tabs {
  margin-top: 30rpx;
  white-space: nowrap;
}

.house-tab-row {
  display: flex;
  align-items: center;
  gap: 34rpx;
  min-width: 100%;
}

.house-tab {
  position: relative;
  flex: 0 0 auto;
  color: #4b5563;
  font-size: 27rpx;
  font-weight: 500;
  line-height: 46rpx;
}

.house-tab.active {
  color: #111827;
  font-size: 31rpx;
  font-weight: 800;
}

.house-tab.active::after {
  content: "";
  position: absolute;
  right: 16rpx;
  bottom: -8rpx;
  left: 16rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #1fc56f;
}

.house-sale-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.house-sale-card {
  overflow: hidden;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.05);
}

.house-sale-cover {
  position: relative;
  overflow: hidden;
  height: 214rpx;
  background: #dcefe7;
}

.house-sale-image,
.house-rent-image {
  display: block;
  width: 100%;
  height: 100%;
}

.house-cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3fd487 0%, #b8f2d3 100%);
}

.house-sale-location {
  position: absolute;
  bottom: 10rpx;
  left: 10rpx;
  max-width: 250rpx;
  overflow: hidden;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 8rpx;
  background: rgba(0, 0, 0, 0.52);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 34rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.house-sale-body {
  padding: 16rpx 14rpx 18rpx;
}

.house-sale-title {
  display: -webkit-box;
  overflow: hidden;
  height: 68rpx;
  color: #111827;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 34rpx;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.house-sale-meta {
  display: block;
  overflow: hidden;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 21rpx;
  line-height: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.house-sale-price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-top: 10rpx;
}

.house-sale-price {
  color: #f04438;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 36rpx;
}

.house-sale-unit {
  min-width: 0;
  overflow: hidden;
  color: #9ca3af;
  font-size: 19rpx;
  line-height: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.house-sale-tags,
.house-rent-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 12rpx;
  overflow: hidden;
}

.house-sale-tag,
.house-rent-tag {
  flex: 0 0 auto;
  height: 32rpx;
  padding: 0 10rpx;
  border-radius: 6rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 19rpx;
  line-height: 32rpx;
  white-space: nowrap;
}

.house-rent-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.house-rent-card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.05);
}

.house-rent-cover {
  flex-shrink: 0;
  overflow: hidden;
  width: 214rpx;
  height: 158rpx;
  border-radius: 14rpx;
  background: #dcefe7;
}

.house-rent-main {
  flex: 1;
  min-width: 0;
}

.house-rent-title {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 36rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.house-rent-meta {
  display: block;
  overflow: hidden;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.house-rent-price {
  display: block;
  margin-top: 14rpx;
  color: #f04438;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 40rpx;
}

.category-page--jobs {
  overflow-x: hidden;
  padding: 0 20rpx 160rpx;
}

.jobs-shell {
  min-height: 100vh;
  padding-top: 104rpx;
}

.jobs-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 104rpx;
  padding: 0 20rpx;
}

.jobs-nav-back {
  position: absolute;
  left: 0;
  top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.jobs-nav-title {
  color: #10233f;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.jobs-top {
  margin: 0 -20rpx;
  padding: 34rpx 24rpx 20rpx;
}

.jobs-search {
  display: flex;
  align-items: center;
  gap: 14rpx;
  height: 78rpx;
  padding: 0 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #10233f;
}

.jobs-search-city {
  max-width: 250rpx;
  overflow: hidden;
  font-size: 26rpx;
  line-height: 78rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobs-search-arrow {
  color: #10233f;
  font-size: 24rpx;
}

.jobs-search-line {
  width: 2rpx;
  height: 32rpx;
  background: #d8dde7;
}

.jobs-search-keyword {
  flex: 1;
  min-width: 0;
  color: #10233f;
  font-size: 28rpx;
  line-height: 78rpx;
}

.jobs-panel {
  margin-top: 20rpx;
  padding: 24rpx 18rpx 20rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.96);
}

.jobs-panel-tabs {
  display: flex;
  gap: 48rpx;
  padding: 0 10rpx;
}

.jobs-panel-tab {
  position: relative;
  color: #10233f;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.jobs-panel-tab.active::after {
  content: "";
  position: absolute;
  bottom: -6rpx;
  left: 14rpx;
  width: 26rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #05d98d;
}

.job-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 22rpx;
}

.job-sort {
  display: flex;
  gap: 10rpx;
}

.job-sort-item {
  min-width: 72rpx;
  height: 56rpx;
  padding: 0 14rpx;
  border-radius: 15rpx;
  background: #eaedf3;
  color: #10233f;
  font-size: 23rpx;
  font-weight: 500;
  line-height: 56rpx;
  text-align: center;
}

.job-sort-item.active {
  background: #dffbf2;
  color: #02c982;
}

.job-filter-actions {
  display: flex;
  align-items: center;
  height: 56rpx;
  padding: 0 12rpx;
  border-radius: 15rpx;
  background: #e9ecf3;
  color: #10233f;
  font-size: 22rpx;
  font-weight: 500;
}

.job-filter-button,
.job-reset-button {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 56rpx;
}

.job-reset-button {
  color: #9ca6b8;
}

.job-filter-divider {
  width: 2rpx;
  height: 28rpx;
  margin: 0 12rpx;
  background: #d3d8e3;
}

.job-filter-symbol,
.job-reset-symbol {
  font-size: 23rpx;
  font-weight: 500;
  line-height: 1;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 22rpx;
}

.job-card {
  padding: 30rpx 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
}

.job-card-head {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.job-title {
  display: block;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #10233f;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 42rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-salary {
  flex: 0 0 auto;
  color: #ff5666;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 42rpx;
  white-space: nowrap;
}

.job-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  overflow: hidden;
}

.job-tag {
  flex: 0 0 auto;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 10rpx;
  background: #f0f2f7;
  color: #6f7889;
  font-size: 20rpx;
  font-weight: 400;
  line-height: 34rpx;
  white-space: nowrap;
}

.job-card-bottom {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 18rpx;
}

.job-company-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #237cff;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 400;
}

.job-company-main {
  flex: 1;
  min-width: 0;
}

.job-company-line {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.job-company-name {
  overflow: hidden;
  max-width: 270rpx;
  color: #334155;
  font-size: 23rpx;
  font-weight: 400;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-verify {
  height: 28rpx;
  padding: 0 8rpx;
  border-radius: 15rpx;
  background: #dbeafe;
  color: #1677ff;
  font-size: 18rpx;
  font-weight: 400;
  line-height: 28rpx;
  white-space: nowrap;
}

.job-address {
  display: block;
  overflow: hidden;
  max-width: 380rpx;
  margin-top: 4rpx;
  color: #7c8798;
  font-size: 22rpx;
  font-weight: 400;
  line-height: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-apply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 148rpx;
  height: 64rpx;
  border-radius: 15rpx;
  background: #dcfbf2;
  color: #04c987;
  font-size: 24rpx;
  font-weight: 400;
  white-space: nowrap;
}

.filter-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.72);
}

.filter-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 880rpx;
  border-radius: 44rpx 44rpx 0 0;
  background: #ffffff;
  animation: filterSheetUp 240ms ease-out;
}

.filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 42rpx 30rpx 28rpx;
}

.filter-title {
  color: #10233f;
  font-size: 36rpx;
  font-weight: 500;
  line-height: 56rpx;
}

.filter-close {
  width: 64rpx;
  height: 64rpx;
  color: #a7afbf;
  font-size: 58rpx;
  font-weight: 300;
  line-height: 58rpx;
  text-align: center;
}

.filter-body {
  display: flex;
  flex: 1;
  min-height: 0;
  border-top: 2rpx solid #edf0f5;
}

.filter-left {
  flex: 0 0 154rpx;
}

.filter-left-item {
  display: flex;
  align-items: center;
  height: 98rpx;
  padding-left: 28rpx;
  border-radius: 0 22rpx 22rpx 0;
  color: #10233f;
  font-size: 24rpx;
  font-weight: 400;
}

.filter-left-item.active {
  background: #f0f2f8;
}

.filter-options {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx 16rpx;
  align-content: flex-start;
  padding: 32rpx 28rpx 0 26rpx;
}

.filter-option {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 66rpx;
  border-radius: 22rpx;
  background: #f0f2f8;
  color: #7c8798;
  font-size: 23rpx;
  font-weight: 400;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-option.active {
  background: #dffbf2;
  color: #04c987;
}

.filter-type {
  display: flex;
  flex: 1;
  min-width: 0;
}

.filter-type-groups {
  flex: 0 0 180rpx;
  height: 570rpx;
  border-right: 2rpx solid #edf0f5;
}

.filter-type-group {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding-left: 24rpx;
  color: #10233f;
  font-size: 24rpx;
  font-weight: 400;
}

.filter-type-group.active {
  color: #04c987;
  font-weight: 500;
}

.filter-type-options {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, 1fr);
  gap: 22rpx 18rpx;
  align-content: flex-start;
  padding: 32rpx 24rpx;
}

.filter-footer {
  display: flex;
  gap: 18rpx;
  padding: 24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 2rpx solid #edf0f5;
  background: #ffffff;
}

.filter-reset,
.filter-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.filter-reset {
  flex: 0 0 220rpx;
  gap: 12rpx;
  background: #f0f2f8;
  color: #10233f;
}

.filter-confirm {
  flex: 1;
  background: #05d98d;
  color: #10233f;
}

@keyframes filterSheetUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.category-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 24rpx;
  border-radius: 0 0 44rpx 44rpx;
  background:
    radial-gradient(circle at 84% 14%, rgba(255, 255, 255, 0.74) 0, rgba(255, 255, 255, 0) 190rpx),
    linear-gradient(135deg, #ddffe2 0%, #9af556 100%);
  box-shadow: 0 18rpx 42rpx rgba(92, 206, 73, 0.16);
}

.publish-mini {
  width: 112rpx;
  height: 64rpx;
  border-radius: 15rpx;
  background: #222222;
  color: #ffffff;
  font-size: 26rpx;
  line-height: 64rpx;
}

.tabs {
  margin-top: 24rpx;
  white-space: nowrap;
}

.tab-row {
  display: flex;
  gap: 16rpx;
}

.tab,
.filter {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #666666;
  font-size: 26rpx;
  line-height: 64rpx;
}

.tab.active {
  background: #222222;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 6rpx 18rpx rgba(121, 248, 157, 0.3);
}

.filters {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.filter {
  border: 2rpx solid rgba(121, 248, 157, 0.26);
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding: 26rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(12rpx);
}

.summary-title {
  display: block;
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 44rpx;
}

.summary-desc {
  display: block;
  margin-top: 8rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 34rpx;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #20d962 0%, #9af556 100%);
  color: #34d19d;
  box-shadow: 0 12rpx 26rpx rgba(56, 189, 61, 0.25);
}

.standard-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.standard-card {
  padding: 30rpx 28rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.05);
}

.standard-card-head {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.standard-title {
  display: block;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #10233f;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 42rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-side {
  flex: 0 0 auto;
  max-width: 180rpx;
  overflow: hidden;
  color: #ff5666;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 42rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-summary {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 12rpx;
  color: #596273;
  font-size: 24rpx;
  font-weight: 400;
  line-height: 36rpx;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.standard-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  overflow: hidden;
}

.standard-tag {
  flex: 0 0 auto;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 10rpx;
  background: #f0f2f7;
  color: #6f7889;
  font-size: 20rpx;
  font-weight: 400;
  line-height: 34rpx;
  white-space: nowrap;
}

.standard-card-bottom {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 18rpx;
}

.standard-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #237cff;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 400;
}

.standard-main {
  flex: 1;
  min-width: 0;
}

.standard-line {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.standard-name {
  overflow: hidden;
  max-width: 260rpx;
  color: #334155;
  font-size: 23rpx;
  font-weight: 400;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-verify {
  height: 28rpx;
  padding: 0 8rpx;
  border-radius: 15rpx;
  background: #dbeafe;
  color: #1677ff;
  font-size: 18rpx;
  font-weight: 400;
  line-height: 28rpx;
  white-space: nowrap;
}

.standard-address {
  display: block;
  overflow: hidden;
  max-width: 390rpx;
  margin-top: 4rpx;
  color: #7c8798;
  font-size: 22rpx;
  font-weight: 400;
  line-height: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 128rpx;
  height: 60rpx;
  border-radius: 15rpx;
  background: #dcfbf2;
  color: #04c987;
  font-size: 24rpx;
  font-weight: 400;
  white-space: nowrap;
}

.secondhand-waterfall {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  margin-top: 24rpx;
}

.secondhand-column {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18rpx;
  min-width: 0;
}

.secondhand-card {
  overflow: hidden;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.05);
}

.secondhand-cover {
  overflow: hidden;
  background: #eceff4;
}

.secondhand-cover--normal {
  height: 300rpx;
}

.secondhand-cover--tall {
  height: 390rpx;
}

.secondhand-image {
  display: block;
  width: 100%;
  height: 100%;
}

.secondhand-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffd966 0%, #ff8f5a 100%);
}

.secondhand-body {
  padding: 18rpx 16rpx 20rpx;
}

.secondhand-title {
  display: -webkit-box;
  overflow: hidden;
  color: #1f2937;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 38rpx;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.secondhand-time {
  display: block;
  overflow: hidden;
  margin-top: 10rpx;
  color: #5d6470;
  font-size: 23rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondhand-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-top: 10rpx;
}

.secondhand-price {
  color: #ff3d4f;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 44rpx;
}

.secondhand-want {
  min-width: 0;
  overflow: hidden;
  color: #9ca3af;
  font-size: 22rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondhand-seller-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 12rpx;
}

.secondhand-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 20rpx;
}

.secondhand-seller {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #8a94a6;
  font-size: 22rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 28rpx;
  padding: 48rpx 32rpx;
}

.empty-title {
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
}

.empty-desc {
  margin: 12rpx 0 28rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 36rpx;
  text-align: center;
}
</style>
