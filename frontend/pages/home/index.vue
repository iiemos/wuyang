<template>
  <view class="app-page home-page">
    <view class="top-panel">
      <AppHeader title="舞阳云" subtitle="15分钟搞定身边需求" />

      <view class="search tap" @tap="goSearch">
        <view class="search-location">
          <text class="search-city">{{ city }}</text>
        </view>
        <view class="search-divider"></view>
        <text class="search-placeholder">咖啡师</text>
        <AppIcon name="lucide:search" color="#374151" size="42rpx" />
      </view>
    </view>

    <swiper
      class="hero-swiper"
      circular
      autoplay
      indicator-dots
      indicator-color="rgba(17, 52, 29, 0.22)"
      indicator-active-color="#11341D"
      :interval="4200"
      :duration="520"
      @change="handleBannerChange"
    >
      <swiper-item v-for="item in banners" :key="item.key" @tap="openBanner(item)">
        <view class="hero tap">
          <view class="hero-copy">
            <text class="hero-kicker">今日推荐</text>
            <text class="hero-title">{{ item.title }}</text>
            <text class="hero-desc">{{ item.desc }}</text>
          </view>
          <view class="hero-art">
            <image v-if="item.image" :src="item.image" mode="aspectFill" />
            <AppIcon v-else name="lucide:hand-heart" color="#FFFFFF" size="72rpx" />
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="searchFixed" class="search-fixed" :style="searchFixedStyle">
      <view class="search search--fixed tap" @tap="goSearch">
        <view class="search-location">
          <text class="search-city">{{ city }}</text>
        </view>
        <view class="search-divider"></view>
        <text class="search-placeholder">咖啡师</text>
        <AppIcon name="lucide:search" color="#374151" size="42rpx" />
      </view>
    </view>

    <view class="grid card">
      <view
        v-for="item in serviceCategories"
        :key="item.type"
        class="grid-item tap"
        @tap="goCategory(item.type)"
      >
        <view class="grid-icon">
          <AppIcon :name="item.icon" color="#34D19D" size="38rpx" />
        </view>
        <text class="grid-title">{{ item.label }}</text>
        <text class="grid-desc">{{ categoryDesc(item) }}</text>
      </view>
    </view>

    <view class="promo-row">
      <view class="promo-card promo-card--warm tap" @tap="goCategory('houses')">
        <text class="promo-label">找房指南</text>
        <text class="promo-title">整租合租一屏看</text>
        <text class="promo-desc">真实房源 本地联系</text>
      </view>
      <view class="promo-card promo-card--cool tap" @tap="goCategory('convenience')">
        <text class="promo-label">便民互助</text>
        <text class="promo-title">拼车求助快响应</text>
        <text class="promo-desc">同城消息 即刻发布</text>
      </view>
    </view>

    <view class="publish-strip">
      <view class="strip-icon">
        <AppIcon name="lucide:square-plus" color="#FFFFFF" size="42rpx" />
      </view>
      <view class="strip-copy">
        <text class="strip-title">有信息要发布？</text>
        <text class="strip-desc">招聘、房源、拼车、闲置都能本地预览</text>
      </view>
      <view class="strip-btn tap" @tap="goPublish">立即发布</view>
    </view>

    <view class="section-head">
      <text class="section-title">精选推荐</text>
      <view class="text-btn tap" @tap="goRecommend">
        <text class="text-btn__label">更多</text>
        <AppIcon name="lucide:chevron-right" color="#A8A8A8" size="26rpx" />
      </view>
    </view>
    <view class="list">
      <ListingCard v-for="item in featured" :key="item.id" :item="item" :type="item.type" variant="standard" />
      <view v-if="!featured.length" class="empty-card card">暂无精选推荐，请先在后台审核或发布信息。</view>
    </view>

    <view class="section-head">
      <text class="section-title">本地资讯</text>
      <view class="text-btn tap" @tap="goCategory('news')">
        <text class="text-btn__label">全部</text>
        <AppIcon name="lucide:chevron-right" color="#A8A8A8" size="26rpx" />
      </view>
    </view>
    <view class="news card tap" v-for="item in newsList" :key="item.id" @tap="openDetail(item)">
      <view class="news-mark">
        <AppIcon name="lucide:newspaper" color="#FFFFFF" size="40rpx" />
      </view>
      <view class="news-main">
        <text class="news-title">{{ item.title }}</text>
        <text class="news-desc line-clamp-2">{{ item.summary }}</text>
      </view>
    </view>
    <view v-if="!newsList.length" class="empty-card card">暂无本地资讯，请在后台发布资讯。</view>

    <BottomTab active="home" />
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import BottomTab from '../../components/BottomTab.vue'
import ListingCard from '../../components/ListingCard.vue'
import { getHomeData } from '../../utils/api'
import { serviceCategories as defaultCategories } from '../../data/catalog'

const fallbackBanner = { key: 'fallback-banner', title: '本地生活服务', desc: '附近信息实时更新', type: 'jobs' }

export default {
  components: { AppHeader, AppIcon, BottomTab, ListingCard },
  data() {
    return {
      banners: [fallbackBanner],
      bannerIndex: 0,
      city: '舞阳',
      serviceCategories: defaultCategories,
      featured: [],
      newsList: [],
      searchFixed: false,
      searchFixedTop: 8,
      searchFixedThreshold: 180
    }
  },
  computed: {
    banner() {
      return this.banners[this.bannerIndex] || fallbackBanner
    },
    searchFixedStyle() {
      return `padding-top: ${this.searchFixedTop}px;`
    }
  },
  onLoad() {
    this.initSearchFixed()
    this.loadHome()
  },
  onReady() {
    this.updateSearchFixedThreshold()
  },
  onPageScroll(event) {
    const scrollTop = event && event.scrollTop ? event.scrollTop : 0
    const fixed = scrollTop >= this.searchFixedThreshold
    if (this.searchFixed !== fixed) this.searchFixed = fixed
  },
  methods: {
    initSearchFixed() {
      try {
        const info = uni.getSystemInfoSync()
        this.searchFixedTop = (info.statusBarHeight || 0) + 8
      } catch {
        this.searchFixedTop = 8
      }
    },
    updateSearchFixedThreshold() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.top-panel .search').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
          const rect = res && res[0]
          const viewport = res && res[1]
          if (!rect) return
          const scrollTop = viewport && viewport.scrollTop ? viewport.scrollTop : 0
          this.searchFixedThreshold = Math.max(0, rect.top + scrollTop - this.searchFixedTop)
        })
      })
    },
    async loadHome() {
      try {
        const data = await getHomeData()
        this.banners = data.banners && data.banners.length ? data.banners.map(this.normalizeBannerKey) : this.banners.map(this.normalizeBannerKey)
        this.bannerIndex = 0
        this.city = data.settings && data.settings.city ? data.settings.city : this.city
        this.serviceCategories = data.categories && data.categories.length ? data.categories : this.serviceCategories
        this.featured = data.featured && data.featured.length ? data.featured.map(this.normalizeFeaturedItem) : this.featured
        this.newsList = data.news && data.news.length ? data.news : this.newsList
      } catch {
        return
      }
    },
    normalizeBannerKey(item, index) {
      return {
        ...item,
        key: item.id || item.title || `banner-${index}`
      }
    },
    normalizeFeaturedItem(item) {
      if (!item || !item.type) return item
      const category = this.serviceCategories.find((entry) => entry.type === item.type)
        || defaultCategories.find((entry) => entry.type === item.type)
      return category ? { ...item, tag: category.label } : item
    },
    goCategory(type) {
      uni.navigateTo({ url: `/pages/category/index?type=${type}` })
    },
    categoryDesc(item) {
      return item.desc
    },
    handleBannerChange(event) {
      this.bannerIndex = event.detail && event.detail.current ? event.detail.current : 0
    },
    openBanner(item) {
      const target = item || this.banner
      this.goCategory(target.type || target.linkValue || 'jobs')
    },
    goSearch() {
      uni.navigateTo({ url: '/pages/search/index' })
    },
    goRecommend() {
      uni.navigateTo({ url: '/pages/recommend/index' })
    },
    goPublish() {
      uni.reLaunch({ url: '/pages/publish/index' })
    },
    openDetail(item) {
      uni.navigateTo({ url: `/pages/detail/index?type=news&id=${item.id}` })
    }
  }
}
</script>

<style scoped>
.top-panel {
  position: relative;
  overflow: hidden;
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 28rpx;
  border-radius: 0 0 20rpx 20rpx;
  background:
    radial-gradient(circle at 86% 14%, rgba(255, 255, 255, 0.78) 0, rgba(255, 255, 255, 0) 190rpx),
    linear-gradient(135deg, #d9ffd7 0%, #9bf88e 46%, #67df78 100%);
  box-shadow: 0 20rpx 48rpx rgba(80, 202, 74, 0.18);
}

.top-panel::before {
  position: absolute;
  top: 22rpx;
  right: 58rpx;
  width: 154rpx;
  height: 154rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.48);
  border-radius: 50%;
  content: '';
}

.hero-swiper {
  height: 260rpx;
  margin-top: 24rpx;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 18rpx 8rpx 24rpx;
}

.hero-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.hero-kicker {
  width: fit-content;
  height: 42rpx;
  padding: 0 18rpx;
  border-radius: 21rpx;
  background: rgba(255, 255, 255, 0.46);
  color: #116d2b;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.hero-title {
  color: #11341d;
  font-size: 56rpx;
  font-weight: 800;
  line-height: 66rpx;
}

.hero-desc {
  color: rgba(17, 52, 29, 0.72);
  font-size: 28rpx;
  line-height: 38rpx;
}

.hero-art {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 154rpx;
  height: 154rpx;
  border: 12rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 52rpx;
  background: linear-gradient(135deg, #10c957 0%, #90ed31 100%);
  box-shadow: 0 18rpx 34rpx rgba(37, 170, 72, 0.28);
}

.hero-art image {
  width: 100%;
  height: 100%;
}

.search {
  display: flex;
  align-items: center;
  gap: 24rpx;
  height: 92rpx;
  margin-top: 18rpx;
  padding: 0 26rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.96);
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 14rpx 34rpx rgba(17, 82, 40, 0.12);
  backdrop-filter: blur(18rpx);
}

.search-fixed {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  padding-right: 28rpx;
  padding-bottom: 22rpx;
  padding-left: 28rpx;
  border-radius: 0 0 20rpx 20rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 26rpx rgba(15, 23, 42, 0.06);
}

.search--fixed {
  margin-top: 0;
  border-color: #eef0f6;
  background: #f3f5fb;
  box-shadow: none;
}

.search-location {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 190rpx;
}

.search-city {
  overflow: hidden;
  color: #1f2937;
  font-size: 26rpx;
  line-height: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.search-divider {
  flex-shrink: 0;
  width: 2rpx;
  height: 42rpx;
  background: rgba(31, 41, 55, 0.14);
}

.search-placeholder {
  flex: 1;
  min-width: 0;
  color: #5d6673;
  font-size: 26rpx;
}

.empty-card {
  padding: 32rpx;
  color: #666666;
  font-size: 26rpx;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-top: 24rpx;
  padding: 22rpx 18rpx;
}

.grid-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 156rpx;
  padding: 12rpx 8rpx;
}

.grid-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #effff4 0%, #e1ffe2 100%);
  color: #34d19d;
}

.grid-title {
  margin-top: 12rpx;
  color: #1a1a1a;
  font-size: 28rpx;
  font-weight: 600;
}

.grid-desc {
  margin-top: 4rpx;
  color: #999999;
  font-size: 22rpx;
  line-height: 28rpx;
}

.promo-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 22rpx;
}

.promo-card {
  min-height: 150rpx;
  padding: 22rpx;
  border-radius: 34rpx;
  box-shadow: 0 14rpx 30rpx rgba(41, 91, 53, 0.08);
}

.promo-card--warm {
  background: linear-gradient(135deg, #fff7d9 0%, #ffdf8c 100%);
}

.promo-card--cool {
  background: linear-gradient(135deg, #dcfbff 0%, #bdf7e9 100%);
}

.promo-label,
.promo-desc,
.promo-title {
  display: block;
}

.promo-label {
  color: rgba(26, 26, 26, 0.54);
  font-size: 22rpx;
  font-weight: 600;
}

.promo-title {
  margin-top: 8rpx;
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.promo-desc {
  margin-top: 8rpx;
  color: #666666;
  font-size: 22rpx;
}

.publish-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 34rpx;
  background: #222222;
  box-shadow: 0 16rpx 34rpx rgba(0, 0, 0, 0.12);
}

.strip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 72rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #79f89d 0%, #9af556 100%);
}

.strip-copy {
  flex: 1;
  min-width: 0;
}

.section-title {
  color: #1a1a1a;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.strip-title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.strip-desc {
  display: block;
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.68);
  font-size: 24rpx;
  line-height: 32rpx;
}

.strip-btn {
  flex: 0 0 168rpx;
  width: 168rpx;
  height: 64rpx;
  border-radius: 15rpx;
  background: #ffffff;
  color: #222222;
  font-size: 24rpx;
  line-height: 64rpx;
  text-align: center;
  white-space: nowrap;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 40rpx 0 20rpx;
}

.text-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 4rpx;
  margin-left: auto;
  margin-right: 0;
  padding: 0;
  width: auto;
  min-width: 0;
  height: 40rpx;
  border: 0;
  background: transparent;
  color: #a8a8a8;
  font-size: 24rpx;
  font-weight: 400;
  line-height: 40rpx;
  box-shadow: none;
}

.text-btn::after {
  border: 0;
}

.text-btn__label {
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.news {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
}

.news-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 80rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 28rpx;
  background: #cbcdfe;
  color: #ffffff;
}

.news-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.news-title {
  overflow: hidden;
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 40rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-desc {
  margin-top: 8rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 36rpx;
}
</style>
