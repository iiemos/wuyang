<template>
  <view class="app-page search-page" :class="{ 'job-search-page': isJobSearch }">
    <view v-if="isJobSearch" class="job-search-inner">
      <view class="job-search-nav">
        <view class="job-search-back tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#10233F" size="42rpx" />
        </view>
        <text class="job-search-title">职位搜索</text>
      </view>

      <view class="job-search-box">
        <input v-model="keyword" focus confirm-type="search" placeholder="客服" @confirm="search" />
        <view class="job-search-submit tap" @tap="search">
          <AppIcon name="lucide:search" color="#10233F" size="34rpx" />
          <text>搜索</text>
        </view>
      </view>

      <view v-if="!searched" class="job-search-content">
        <view class="job-search-section">
          <view class="job-section-head">
            <text class="job-section-title">热门搜索 🔥</text>
            <view class="job-section-change tap" @tap="rotateHot">
              <text>换一批</text>
              <text class="job-refresh">↻</text>
            </view>
          </view>
          <view class="hot-grid">
            <view v-for="item in visibleHotWords" :key="item.label" class="hot-word tap" @tap="quickSearch(item.label)">
              <text>{{ item.label }}</text>
              <text v-if="item.hot" class="hot-badge">HOT</text>
            </view>
          </view>
        </view>

        <view class="job-search-section">
          <view class="job-section-head">
            <text class="job-section-title">猜你喜欢 💕</text>
            <view class="job-section-change tap" @tap="rotateGuess">
              <text>换一批</text>
              <text class="job-refresh">↻</text>
            </view>
          </view>
          <view class="guess-grid">
            <view v-for="item in visibleGuessWords" :key="item.label" class="guess-card tap" @tap="quickSearch(item.label)">
              <text class="guess-icon">{{ item.icon }}</text>
              <text class="guess-label">{{ item.label }}</text>
              <text class="guess-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="job-results">
        <view class="job-section-head result-head">
          <text class="job-section-title">搜索结果</text>
          <text class="result-count">{{ results.length }} 条</text>
        </view>
        <view v-if="results.length" class="result-list">
          <view v-for="job in results" :key="job.id" class="result-card tap" @tap="openJobDetail(job)">
            <view class="result-main">
              <view class="result-headline">
                <text class="result-title">{{ job.title }}</text>
                <text class="result-salary">{{ job.price }}</text>
              </view>
              <view class="result-tags">
                <text v-for="tag in jobTags(job)" :key="tag" class="result-tag">{{ tag }}</text>
              </view>
              <text class="result-address">{{ displayJobAddress(job) }}</text>
            </view>
            <view class="result-apply tap" @tap.stop="openJobDetail(job)">立即报名</view>
          </view>
        </view>
        <view v-else class="empty card">
          <text class="empty-title">没有找到相关岗位</text>
          <text class="empty-desc">换个关键词试试，例如“客服”“司机”“收银”。</text>
        </view>
      </view>
    </view>

    <view v-else class="normal-search-inner">
      <view class="search-hero">
        <AppHeader title="搜索" subtitle="快速找到本地信息" back />
        <view class="search-box">
          <AppIcon name="lucide:search" color="#34D19D" size="34rpx" />
          <input v-model="keyword" focus confirm-type="search" placeholder="搜岗位、房源、商家、二手好物" @confirm="search" />
          <view class="search-action tap" @tap="search">搜索</view>
        </view>
      </view>

      <view v-if="!searched" class="normal-search-content">
        <view class="section">
          <view class="section-head">
            <text class="section-title">搜索发现</text>
          </view>
          <view class="chips">
            <view v-for="item in discoveries" :key="item" class="chip-btn tap" @tap="quickSearch(item)">{{ item }}</view>
          </view>
        </view>

        <view class="section" v-if="history.length">
          <view class="section-head">
            <text class="section-title">浏览历史</text>
            <view class="clear tap" @tap="clearHistory">清空</view>
          </view>
          <view class="history-list">
            <view v-for="item in history" :key="item" class="history-item tap" @tap="quickSearch(item)">
              <AppIcon name="lucide:clock-3" color="#9CA3AF" size="28rpx" />
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="normal-results">
        <view class="section-head result-head">
          <text class="section-title">搜索结果</text>
          <text class="result-count">{{ results.length }} 条</text>
        </view>
        <view v-if="results.length" class="list">
          <ListingCard v-for="item in results" :key="item.id" :item="item" :type="item.type" />
        </view>
        <view v-else class="empty card">
          <text class="empty-title">没有找到相关信息</text>
          <text class="empty-desc">换个关键词试试，例如“兼职”“整租”“家政”。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import ListingCard from '../../components/ListingCard.vue'
import { getCategories, getListings } from '../../utils/api'

const historyKey = 'qingning_search_history'
const jobHistoryKey = 'qingning_job_search_history'
const jobAreas = ['舞阳县', '源汇区', '郾城区', '召陵区', '临颍县']

export default {
  components: { AppHeader, AppIcon, ListingCard },
  data() {
    return {
      searchType: '',
      keyword: '',
      searched: false,
      results: [],
      history: [],
      discoveries: ['兼职', '整租', '拼车', '家政', '二手手机', '招聘', '商铺转让', '维修'],
      hotPage: 0,
      guessPage: 0,
      hotWords: [
        { label: '附近岗位' },
        { label: '暑期工专场', hot: true },
        { label: '日结' },
        { label: '奶茶店员', hot: true },
        { label: '批改作业' },
        { label: '收银' },
        { label: '咖啡师', hot: true },
        { label: '保安' },
        { label: '服务员' },
        { label: '导购' },
        { label: '司机' },
        { label: '超市零售' },
        { label: '配送物流' },
        { label: '文员' }
      ],
      guessWords: [
        { label: '时薪高', icon: '💰' },
        { label: '名企专场', icon: '🏛️' },
        { label: '打包分拣专场', icon: '🧥' },
        { label: '线下专场', icon: '🏙️' },
        { label: '周结岗位', icon: '📅' },
        { label: '无需经验', icon: '✨' }
      ]
    }
  },
  computed: {
    isJobSearch() {
      return this.searchType === 'jobs'
    },
    visibleHotWords() {
      const start = this.hotPage * 12
      const list = this.hotWords.slice(start, start + 12)
      return list.length ? list : this.hotWords.slice(0, 12)
    },
    visibleGuessWords() {
      const start = this.guessPage * 4
      const list = this.guessWords.slice(start, start + 4)
      return list.length ? list : this.guessWords.slice(0, 4)
    }
  },
  async onLoad(query) {
    this.searchType = query && query.type ? query.type : ''
    this.history = uni.getStorageSync(this.isJobSearch ? jobHistoryKey : historyKey) || []
    if (!this.isJobSearch) await this.loadDiscoveries()
    if (query && query.keyword) {
      this.keyword = query.keyword
      this.search()
    }
  },
  methods: {
    async search() {
      const word = this.keyword.trim()
      if (!word) {
        uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
        return
      }
      this.searched = true
      this.saveHistory(word)
      try {
        const params = this.isJobSearch ? { type: 'jobs', keyword: word, pageSize: 100 } : { keyword: word, pageSize: 100 }
        const data = await getListings(params)
        this.results = data.items || []
      } catch {
        uni.showToast({ title: '搜索失败，请稍后重试', icon: 'none' })
      }
    },
    quickSearch(word) {
      this.keyword = word
      this.search()
    },
    saveHistory(word) {
      this.history = [word, ...this.history.filter((item) => item !== word)].slice(0, 8)
      uni.setStorageSync(this.isJobSearch ? jobHistoryKey : historyKey, this.history)
    },
    clearHistory() {
      this.history = []
      uni.removeStorageSync(this.isJobSearch ? jobHistoryKey : historyKey)
    },
    rotateHot() {
      const maxPage = Math.ceil(this.hotWords.length / 12)
      this.hotPage = maxPage > 1 ? (this.hotPage + 1) % maxPage : 0
    },
    rotateGuess() {
      const maxPage = Math.ceil(this.guessWords.length / 4)
      this.guessPage = maxPage > 1 ? (this.guessPage + 1) % maxPage : 0
    },
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/category/index?type=jobs' })
    },
    openJobDetail(job) {
      if (!job || !job.id) return
      uni.navigateTo({ url: `/pages/detail/index?type=jobs&id=${job.id}` })
    },
    jobTags(job) {
      const tags = Array.isArray(job.highlights) ? job.highlights.filter(Boolean) : []
      return (tags.length ? tags : [job.tag || '招聘']).slice(0, 3)
    },
    displayJobAddress(job) {
      const address = job && job.address ? String(job.address).trim() : '本地'
      const area = jobAreas.find((item) => address.indexOf(item) === 0)
      if (area) {
        const detail = address.slice(area.length).trim()
        return detail ? `${area} ${detail}` : area
      }
      return `舞阳县 ${address}`
    },
    async loadDiscoveries() {
      try {
        const categories = await getCategories()
        const labels = (categories || []).map((item) => item.label).filter(Boolean)
        this.discoveries = [...new Set([...this.discoveries, ...labels])].slice(0, 12)
      } catch {
        return
      }
    }
  }
}
</script>

<style scoped>
.job-search-page {
  min-height: 100vh;
  overflow-x: hidden;
  padding: 0 24rpx 120rpx;
  background: #ffffff;
}

.job-search-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128rpx;
}

.job-search-back {
  position: absolute;
  left: 0;
  top: 38rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.job-search-title {
  color: #10233f;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.job-search-box {
  display: flex;
  align-items: center;
  height: 70rpx;
  border: 2rpx solid #e8ebf2;
  border-radius: 15rpx;
  background: #ffffff;
  overflow: hidden;
}

.job-search-box input {
  flex: 1;
  min-width: 0;
  height: 70rpx;
  padding: 0 28rpx;
  color: #10233f;
  font-size: 26rpx;
}

.job-search-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 160rpx;
  height: 70rpx;
  border-radius: 15rpx;
  background: #05d98d;
  color: #10233f;
  font-size: 28rpx;
  font-weight: 800;
}

.job-search-section {
  margin-top: 44rpx;
}

.job-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.job-section-title {
  color: #10233f;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 44rpx;
}

.job-section-change {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: #8b95a5;
  font-size: 24rpx;
  line-height: 34rpx;
}

.job-refresh {
  font-size: 30rpx;
  line-height: 30rpx;
}

.hot-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx 14rpx;
  margin-top: 24rpx;
}

.hot-word {
  position: relative;
  height: 60rpx;
  padding: 0 28rpx;
  border-radius: 8rpx;
  background: #f0f2f8;
  color: #10233f;
  font-size: 25rpx;
  line-height: 60rpx;
}

.hot-badge {
  position: absolute;
  top: -20rpx;
  right: -16rpx;
  height: 32rpx;
  padding: 0 12rpx;
  border-radius: 18rpx;
  background: #ff5464;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 32rpx;
}

.guess-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx 24rpx;
  margin-top: 24rpx;
}

.guess-card {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 106rpx;
  padding: 0 22rpx;
  border-radius: 20rpx;
  background: #f1f7ff;
}

.guess-icon {
  width: 62rpx;
  font-size: 40rpx;
  line-height: 1;
}

.guess-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #10233f;
  font-size: 28rpx;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guess-arrow {
  color: #a9b0bd;
  font-size: 44rpx;
  line-height: 44rpx;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 22rpx;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #f8fafc;
}

.result-main {
  flex: 1;
  min-width: 0;
}

.result-headline {
  display: flex;
  gap: 14rpx;
}

.result-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #10233f;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 38rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-salary {
  flex-shrink: 0;
  color: #ff5666;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.result-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 12rpx;
  overflow: hidden;
}

.result-tag {
  height: 32rpx;
  padding: 0 10rpx;
  border-radius: 8rpx;
  background: #eef1f6;
  color: #596273;
  font-size: 20rpx;
  line-height: 32rpx;
  white-space: nowrap;
}

.result-address {
  display: block;
  overflow: hidden;
  margin-top: 10rpx;
  color: #7c8798;
  font-size: 22rpx;
  line-height: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-apply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 132rpx;
  height: 56rpx;
  border-radius: 15rpx;
  background: #dcfbf2;
  color: #04c987;
  font-size: 23rpx;
  font-weight: 800;
}

.search-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 28rpx;
  border-radius: 0 0 44rpx 44rpx;
  background: linear-gradient(135deg, #dcffe2 0%, #f8ffcb 100%);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 92rpx;
  margin-top: 20rpx;
  padding: 0 16rpx 0 24rpx;
  border-radius: 34rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 30rpx rgba(29, 123, 56, 0.1);
}

.search-box input {
  flex: 1;
  min-width: 0;
  color: #1a1a1a;
  font-size: 28rpx;
}

.search-action {
  width: 108rpx;
  height: 62rpx;
  border-radius: 15rpx;
  background: #222222;
  text-align: center;
  color: #ffffff;
  font-size: 26rpx;
  line-height: 62rpx;
}

.section {
  margin-top: 34rpx;
}

.section-head,
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.chip-btn {
  height: 64rpx;
  padding: 0 26rpx;
  border-radius: 15rpx;
  background: #ffffff;
  color: #333333;
  font-size: 26rpx;
  line-height: 64rpx;
  box-shadow: 0 10rpx 26rpx rgba(41, 91, 53, 0.08);
}

.clear,
.result-count {
  color: #999999;
  font-size: 24rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 18rpx;
}

.history-item {
  justify-content: flex-start;
  gap: 12rpx;
  height: 68rpx;
  border-radius: 15rpx;
  color: #666666;
  font-size: 26rpx;
}

.result-head {
  margin-top: 32rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.empty {
  margin-top: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
}

.empty-title,
.empty-desc {
  display: block;
}

.empty-title {
  color: #1a1a1a;
  font-size: 32rpx;
  font-weight: 700;
}

.empty-desc {
  margin-top: 12rpx;
  color: #666666;
  font-size: 26rpx;
}
</style>
