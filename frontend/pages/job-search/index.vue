<template>
  <view class="app-page job-search-page">
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
        <view v-for="job in results" :key="job.id" class="result-card tap" @tap="openDetail(job)">
          <view class="result-main">
            <view class="result-headline">
              <text class="result-title">{{ job.title }}</text>
              <text class="result-salary">{{ job.price }}</text>
            </view>
            <view class="result-tags">
              <text v-for="tag in jobTags(job)" :key="tag" class="result-tag">{{ tag }}</text>
            </view>
            <text class="result-address">{{ displayAddress(job) }}</text>
          </view>
          <view class="result-apply tap" @tap.stop="openDetail(job)">立即报名</view>
        </view>
      </view>
      <view v-else class="empty card">
        <text class="empty-title">没有找到相关岗位</text>
        <text class="empty-desc">换个关键词试试，例如“客服”“司机”“收银”。</text>
      </view>
    </view>
  </view>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'
import { getListings } from '../../utils/api'

const historyKey = 'qingning_job_search_history'
const jobAreas = ['舞阳县', '源汇区', '郾城区', '召陵区', '临颍县']

export default {
  components: { AppIcon },
  data() {
    return {
      keyword: '',
      searched: false,
      results: [],
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
  onLoad(query) {
    if (query && query.keyword) {
      this.keyword = query.keyword
      this.search()
    }
  },
  methods: {
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/category/index?type=jobs' })
    },
    rotateHot() {
      const maxPage = Math.ceil(this.hotWords.length / 12)
      this.hotPage = maxPage > 1 ? (this.hotPage + 1) % maxPage : 0
    },
    rotateGuess() {
      const maxPage = Math.ceil(this.guessWords.length / 4)
      this.guessPage = maxPage > 1 ? (this.guessPage + 1) % maxPage : 0
    },
    quickSearch(word) {
      this.keyword = word
      this.search()
    },
    async search() {
      const word = this.keyword.trim()
      if (!word) {
        uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
        return
      }
      this.searched = true
      this.saveHistory(word)
      try {
        const data = await getListings({ type: 'jobs', keyword: word, pageSize: 100 })
        this.results = data.items || []
      } catch {
        uni.showToast({ title: '搜索失败，请稍后重试', icon: 'none' })
      }
    },
    saveHistory(word) {
      const history = uni.getStorageSync(historyKey) || []
      uni.setStorageSync(historyKey, [word, ...history.filter((item) => item !== word)].slice(0, 10))
    },
    openDetail(job) {
      if (!job || !job.id) return
      uni.navigateTo({ url: `/pages/detail/index?type=jobs&id=${job.id}` })
    },
    jobTags(job) {
      const tags = Array.isArray(job.highlights) ? job.highlights.filter(Boolean) : []
      return (tags.length ? tags : [job.tag || '招聘']).slice(0, 3)
    },
    displayAddress(job) {
      const address = job && job.address ? String(job.address).trim() : '本地'
      const area = jobAreas.find((item) => address.indexOf(item) === 0)
      if (area) {
        const detail = address.slice(area.length).trim()
        return detail ? `${area} ${detail}` : area
      }
      return `舞阳县 ${address}`
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

.result-head {
  margin-top: 36rpx;
}

.result-count {
  color: #8b95a5;
  font-size: 24rpx;
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
  color: #10233f;
  font-size: 30rpx;
  font-weight: 800;
}

.empty-desc {
  margin-top: 12rpx;
  color: #657184;
  font-size: 24rpx;
}
</style>
