<template>
  <view class="app-page recommend-page">
    <view class="recommend-hero">
      <AppHeader title="精选推荐" subtitle="按类目浏览本地高频信息" back />
      <scroll-view class="tabs" scroll-x>
        <view class="tab-row">
          <view
            v-for="item in serviceCategories"
            :key="item.type"
            class="tab tap"
            :class="{ active: activeType === item.type }"
            @tap="switchType(item.type)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="summary card">
      <view>
        <text class="summary-title">{{ activeLabel }}</text>
        <text class="summary-desc">{{ activeDesc }}</text>
      </view>
      <view class="summary-icon">
        <AppIcon :name="activeIcon" color="#FFFFFF" size="48rpx" />
      </view>
    </view>

    <view v-if="list.length" class="list">
      <ListingCard v-for="item in list" :key="item.id" :item="item" :type="item.type" />
    </view>
    <view v-else class="empty card">
      <text class="empty-title">暂无推荐信息</text>
      <text class="empty-desc">稍后再来看看，或者切换其他类目。</text>
    </view>
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import ListingCard from '../../components/ListingCard.vue'
import { serviceCategories as defaultCategories } from '../../data/catalog'
import { getCategories, getListings } from '../../utils/api'

export default {
  components: { AppHeader, AppIcon, ListingCard },
  data() {
    return {
      activeType: 'jobs',
      list: [],
      serviceCategories: defaultCategories
    }
  },
  computed: {
    activeMeta() {
      return this.serviceCategories.find((item) => item.type === this.activeType)
    },
    activeLabel() {
      return this.activeMeta ? this.activeMeta.label : '推荐'
    },
    activeDesc() {
      return this.activeMeta ? this.activeMeta.desc : '精选本地信息'
    },
    activeIcon() {
      return this.activeMeta ? this.activeMeta.icon : 'lucide:sparkles'
    }
  },
  async onLoad(query) {
    await this.loadCategories()
    if (query && query.type && this.serviceCategories.some((item) => item.type === query.type)) this.activeType = query.type
    await this.loadList()
  },
  methods: {
    async switchType(type) {
      if (this.activeType === type) return
      this.activeType = type
      await this.loadList()
    },
    async loadList() {
      this.list = []
      try {
        const data = await getListings({ type: this.activeType, pageSize: 100 })
        this.list = data.items || []
      } catch {
        uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
      }
    },
    async loadCategories() {
      try {
        const data = await getCategories()
        this.serviceCategories = data && data.length ? data : this.serviceCategories
      } catch {
        return
      }
    }
  }
}
</script>

<style scoped>
.recommend-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 24rpx;
  border-radius: 0 0 44rpx 44rpx;
  background: linear-gradient(135deg, #ddffe2 0%, #9af556 100%);
}

.tabs {
  margin-top: 22rpx;
  white-space: nowrap;
}

.tab-row {
  display: flex;
  gap: 14rpx;
}

.tab {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.76);
  color: #356247;
  font-size: 26rpx;
  line-height: 64rpx;
}

.tab.active {
  background: #222222;
  color: #ffffff;
  font-weight: 600;
}

.summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 24rpx;
  padding: 26rpx;
}

.summary-title,
.summary-desc {
  display: block;
}

.summary-title {
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 800;
}

.summary-desc {
  margin-top: 8rpx;
  color: #666666;
  font-size: 26rpx;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #20d962 0%, #9af556 100%);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
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
