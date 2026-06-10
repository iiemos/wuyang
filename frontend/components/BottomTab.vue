<template>
  <view class="tab-shell">
    <view class="tabbar">
      <view
        v-for="item in tabs"
        :key="item.key"
        class="tab tap"
        :class="{ active: active === item.key, publish: item.key === 'publish' }"
        @tap="switchTab(item)"
      >
        <view class="icon">
          <AppIcon :name="item.icon" :color="getIconColor(item, active)" size="42rpx" />
        </view>
        <text class="label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import AppIcon from './AppIcon.vue'

const tabs = [
  { key: 'home', label: '首页', icon: 'lucide:home-smile-solid', url: '/pages/home/index' },
  { key: 'life', label: '便民', icon: 'lucide:life-solid', url: '/pages/life/index' },
  { key: 'publish', label: '发布', icon: 'lucide:square-plus', url: '/pages/publish/index' },
  { key: 'messages', label: '消息', icon: 'lucide:message-solid', url: '/pages/messages/index' },
  { key: 'profile', label: '我的', icon: 'lucide:profile-smile-solid', url: '/pages/profile/index' }
]

export default {
  components: { AppIcon },
  props: {
    active: { type: String, required: true }
  },
  data() {
    return { tabs }
  },
  methods: {
    getIconColor(item, activeKey) {
      if (activeKey === item.key && item.key === 'publish') return '#FFFFFF'
      if (activeKey === item.key) return '#34D19D'
      return '#999999'
    },
    switchTab(item) {
      uni.reLaunch({ url: item.url })
    }
  }
}
</script>

<style scoped>
.tab-shell {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  padding: 16rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(248, 252, 249, 0) 0%, rgba(248, 252, 249, 0.96) 32%);
}

.tabbar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: 118rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 42rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -8rpx 34rpx rgba(41, 91, 53, 0.1);
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6rpx;
  color: #999999;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
  transform-origin: center center;
}

.tab:active {
  transform: scale(0.96);
  opacity: 0.92;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border-radius: 20rpx;
}

.label {
  font-size: 22rpx;
  line-height: 28rpx;
}

.active {
  color: #34d19d;
}

.publish.active {
  transform: translateY(-18rpx);
}

.publish.active:active {
  transform: translateY(-18rpx) scale(0.96);
}

.publish.active .icon {
  width: 76rpx;
  height: 76rpx;
  border: 8rpx solid #ffffff;
  border-radius: 50%;
  background: linear-gradient(135deg, #1dd860 0%, #94f243 100%);
  box-shadow: 0 14rpx 30rpx rgba(79, 206, 58, 0.34);
}

.publish.active .label {
  margin-top: -2rpx;
}

.publish.active {
  color: #34d19d;
}
</style>
