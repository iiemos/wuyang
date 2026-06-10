<template>
  <view class="app-page profile-page">
    <view class="profile-hero">
      <AppHeader title="个人中心" subtitle="发布、收藏、认证状态" />

      <view class="user-card">
        <view class="avatar">
          <AppIcon name="lucide:user-round" color="#FFFFFF" size="54rpx" />
        </view>
        <view class="user-info">
          <text class="name">{{ user.nickname }}</text>
          <text class="desc">{{ user.phone }} {{ user.status === 'active' ? '' : '账号已限制' }}</text>
        </view>
        <view class="verify tap">去认证</view>
      </view>
    </view>

    <view class="stats card">
      <view v-for="item in profileStats" :key="item.label" class="stat tap" @tap="openProfileList(item.type)">
        <text class="stat-value">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="menu card">
      <view v-for="item in menus" :key="item.type" class="menu-item tap" @tap="openProfileList(item.type)">
        <text>{{ item.label }}</text>
        <AppIcon name="lucide:chevron-right" color="#999999" size="34rpx" />
      </view>
    </view>

    <view class="safe card">
      <text class="safe-title">发布规范</text>
      <text class="safe-desc">请确保电话、地址和描述真实有效。已成交、已招满、已租售的信息建议及时下架。</text>
    </view>

    <BottomTab active="profile" />
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import BottomTab from '../../components/BottomTab.vue'
import { getProfile } from '../../utils/api'

const menus = [
  { label: '我的发布', type: 'publications' },
  { label: '我的收藏', type: 'favorites' },
  { label: '我的求职', type: 'applications' },
  { label: '商家入驻', type: 'merchant' },
  { label: '举报反馈', type: 'reports' }
]

export default {
  components: { AppHeader, AppIcon, BottomTab },
  data() {
    return {
      menus,
      user: {
        nickname: '舞阳用户',
        phone: '手机号已验证',
        status: 'active'
      },
      profileStats: [
        { label: '发布', value: 0, type: 'publications' },
        { label: '收藏', value: 0, type: 'favorites' },
        { label: '浏览', value: 0, type: 'views' }
      ]
    }
  },
  onLoad() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        const data = await getProfile()
        this.user = data.user || this.user
        this.profileStats = data.stats && data.stats.length ? data.stats : this.profileStats
      } catch {
        return
      }
    },
    openProfileList(type) {
      if (type === 'merchant') {
        uni.showToast({ title: '商家入驻功能即将开放', icon: 'none' })
        return
      }
      uni.navigateTo({ url: `/pages/profile/list?type=${type}` })
    }
  }
}
</script>

<style scoped>
.profile-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 18rpx;
  border-radius: 0 0 44rpx 44rpx;
  background:
    radial-gradient(circle at 86% 10%, rgba(255, 255, 255, 0.74) 0, rgba(255, 255, 255, 0) 180rpx),
    linear-gradient(135deg, #dcffe2 0%, #adfb73 100%);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 18rpx;
  padding: 30rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.72);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 104rpx;
  width: 104rpx;
  height: 104rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #20d962 0%, #9af556 100%);
  box-shadow: 0 12rpx 26rpx rgba(56, 189, 61, 0.25);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
}

.desc {
  display: block;
  margin-top: 8rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 32rpx;
}

.verify {
  width: 132rpx;
  height: 64rpx;
  border-radius: 15rpx;
  background: #222222;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 64rpx;
  text-align: center;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 24rpx;
  padding: 28rpx 0;
}

.stat {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8rpx;
}

.stat-value {
  color: #34d19d;
  font-size: 40rpx;
  font-weight: 700;
}

.stat-label {
  color: #666666;
  font-size: 24rpx;
}

.menu {
  margin-top: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: 0 30rpx;
  border-bottom: 2rpx solid #f0f7f2;
  color: #333333;
  font-size: 30rpx;
}

.menu-item:last-child {
  border-bottom: 0;
}

.safe {
  margin-top: 24rpx;
  padding: 28rpx;
  background: #fffaf0;
}

.safe-title {
  color: #ff9f29;
  font-size: 30rpx;
  font-weight: 700;
}

.safe-desc {
  display: block;
  margin-top: 10rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 36rpx;
}
</style>
