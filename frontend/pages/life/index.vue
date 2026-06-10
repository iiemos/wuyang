<template>
  <view class="app-page life-page">
    <view class="life-hero">
      <AppHeader title="便民信息" subtitle="拼车、失物、打听事、求助" />
      <view class="life-card">
        <view>
          <text class="banner-title">身边小事，快速响应</text>
          <text class="banner-desc">同城互助消息，优先展示可联系信息</text>
        </view>
        <view class="life-icon">
          <AppIcon name="lucide:hand-heart" color="#FFFFFF" size="54rpx" />
        </view>
      </view>
    </view>

    <scroll-view class="tabs" scroll-x>
      <view class="tab-row">
        <view
          v-for="item in quickTypes"
          :key="item"
          class="tab tap"
          :class="{ active: activeTab === item }"
          @tap="switchTab(item)"
        >
          {{ item }}
        </view>
      </view>
    </scroll-view>

    <view v-if="quickFixed" class="quick-fixed" :style="quickFixedStyle">
      <scroll-view class="tabs tabs--fixed" scroll-x>
        <view class="tab-row">
          <view
            v-for="item in quickTypes"
            :key="item"
            class="tab tap"
            :class="{ active: activeTab === item }"
            @tap="switchTab(item)"
          >
            {{ item }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="filteredList.length" class="list">
      <ListingCard v-for="item in filteredList" :key="item.id" :item="item" type="convenience" variant="standard" />
    </view>
    <view v-else class="empty card">
      <text class="empty-title">暂无匹配信息</text>
      <text class="empty-desc">换个分类看看，或者先发布一条便民信息。</text>
      <view class="primary-btn tap" @tap="goPublish">去发布</view>
    </view>

    <BottomTab active="life" />
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import BottomTab from '../../components/BottomTab.vue'
import ListingCard from '../../components/ListingCard.vue'
import { getListings } from '../../utils/api'

const quickTypes = ['全部', '拼车', '失物招领', '打听事', '便民求助']

export default {
  components: { AppHeader, AppIcon, BottomTab, ListingCard },
  data() {
    return {
      quickTypes,
      activeTab: '全部',
      allItems: [],
      quickFixed: false,
      quickFixedTop: 8,
      quickFixedThreshold: 180
    }
  },
  computed: {
    filteredList() {
      if (this.activeTab === '全部') return this.allItems
      return this.allItems.filter((item) => item.tag === this.activeTab)
    },
    quickFixedStyle() {
      return `padding-top: ${this.quickFixedTop}px;`
    }
  },
  onLoad() {
    this.initQuickFixed()
    this.loadLife()
  },
  onReady() {
    this.updateQuickFixedThreshold()
  },
  onPageScroll(event) {
    const scrollTop = event && event.scrollTop ? event.scrollTop : 0
    const fixed = scrollTop >= this.quickFixedThreshold
    if (this.quickFixed !== fixed) this.quickFixed = fixed
  },
  methods: {
    initQuickFixed() {
      try {
        const info = uni.getSystemInfoSync()
        this.quickFixedTop = (info.statusBarHeight || 0) + 8
      } catch {
        this.quickFixedTop = 8
      }
    },
    updateQuickFixedThreshold() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.life-page > .tabs').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
          const rect = res && res[0]
          const viewport = res && res[1]
          if (!rect) return
          const scrollTop = viewport && viewport.scrollTop ? viewport.scrollTop : 0
          this.quickFixedThreshold = Math.max(0, rect.top + scrollTop - this.quickFixedTop)
        })
      })
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    async loadLife() {
      try {
        const data = await getListings({ type: 'convenience', pageSize: 100 })
        this.allItems = data.items && data.items.length ? data.items : this.allItems
      } catch {
        return
      }
    },
    goPublish() {
      uni.reLaunch({ url: '/pages/publish/index?type=convenience' })
    }
  }
}
</script>

<style scoped>
.life-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 24rpx;
  border-radius: 0 0 44rpx 44rpx;
  background:
    radial-gradient(circle at 84% 14%, rgba(255, 255, 255, 0.74) 0, rgba(255, 255, 255, 0) 190rpx),
    linear-gradient(135deg, #ddffe2 0%, #9af556 100%);
  box-shadow: 0 18rpx 42rpx rgba(92, 206, 73, 0.16);
}

.life-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 18rpx;
  padding: 26rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(12rpx);
}

.life-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #20d962 0%, #9af556 100%);
  box-shadow: 0 12rpx 26rpx rgba(56, 189, 61, 0.25);
}

.tabs {
  margin-top: 24rpx;
  white-space: nowrap;
}

.tab-row {
  display: flex;
  gap: 16rpx;
}

.quick-fixed {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  padding-right: 28rpx;
  padding-bottom: 18rpx;
  padding-left: 28rpx;
  border-radius: 0 0 44rpx 44rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 26rpx rgba(15, 23, 42, 0.06);
}

.tabs--fixed {
  margin-top: 0;
}

.tab {
  flex: 0 0 auto;
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

.banner-title {
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 44rpx;
}

.banner-desc {
  display: block;
  margin-top: 8rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 34rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.empty {
  margin-top: 24rpx;
  padding: 34rpx 28rpx;
}

.empty-title,
.empty-desc {
  display: block;
  text-align: center;
}

.empty-title {
  color: #1a1a1a;
  font-size: 32rpx;
  font-weight: 700;
}

.empty-desc {
  margin-top: 10rpx;
  color: #666666;
  font-size: 25rpx;
  line-height: 36rpx;
}

.empty .primary-btn {
  margin-top: 24rpx;
}
</style>
