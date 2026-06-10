<template>
  <view class="app-page publish-select-page">
    <view class="select-shell">
      <view class="select-nav">
        <view class="nav-icon tap" @tap="goHome">
          <AppIcon name="lucide:home-smile-solid" color="#132033" size="38rpx" />
        </view>
      </view>

      <view class="select-head">
        <text class="select-title">选择发布类型</text>
        <text class="select-desc">选择你要发布的信息类型，提交后进入后台审核</text>
      </view>

      <view class="type-grid">
        <view
          v-for="item in publishTypes"
          :key="item.type"
          class="type-card tap"
          :class="{ active: selectedType === item.type }"
          @tap="selectType(item.type)"
        >
          <view class="type-icon">
            <AppIcon :name="item.icon" :color="selectedType === item.type ? '#1FC56F' : '#132033'" size="54rpx" />
          </view>
          <text class="type-title">{{ item.label }}</text>
        </view>
      </view>

      <view class="publish-note">
        <text>没有合适的类型？</text>
        <text class="note-action" @tap="selectType('convenience')">选择便民</text>
        <text>发布求助、打听等信息</text>
      </view>

      <view class="select-submit tap" @tap="goSelected">去发布</view>
    </view>

    <BottomTab active="publish" />

    <view class="house-mode-mask" :class="{ visible: houseModeVisible }" @tap="closeHouseMode">
      <view class="house-mode-sheet" @tap.stop>
        <view class="house-mode-card house-mode-card--sell tap" @tap="goHousePublish('sell')">
          <view class="house-mode-icon house-mode-icon--sell">
            <AppIcon name="lucide:house-market" color="#FFFFFF" size="58rpx" />
          </view>
          <view class="house-mode-copy">
            <view class="house-mode-title-row">
              <text class="house-mode-title">我要卖房</text>
              <text class="house-mode-hot">热门</text>
            </view>
            <text class="house-mode-desc">卖房更快 更省心</text>
          </view>
          <text class="house-mode-arrow">›</text>
        </view>
        <view class="house-mode-card house-mode-card--rent tap" @tap="goHousePublish('rent')">
          <view class="house-mode-icon house-mode-icon--rent">
            <AppIcon name="lucide:store" color="#FFFFFF" size="58rpx" />
          </view>
          <view class="house-mode-copy">
            <text class="house-mode-title">我要出租</text>
            <text class="house-mode-desc">免费发布 极速出租</text>
          </view>
          <text class="house-mode-arrow">›</text>
        </view>
        <view class="house-mode-close tap" @tap="closeHouseMode">×</view>
      </view>
    </view>
  </view>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'
import BottomTab from '../../components/BottomTab.vue'
import { serviceCategories } from '../../data/catalog'

const allowedTypes = ['jobs', 'houses', 'convenience', 'yellowPages', 'secondhand']

export default {
  components: { AppIcon, BottomTab },
  data() {
    return {
      selectedType: 'jobs',
      houseModeVisible: false,
      serviceCategories
    }
  },
  computed: {
    publishTypes() {
      return this.serviceCategories.filter((item) => allowedTypes.indexOf(item.type) !== -1)
    }
  },
  onLoad(query) {
    if (query && allowedTypes.indexOf(query.type) !== -1) this.selectedType = query.type
  },
  methods: {
    goHome() {
      uni.reLaunch({ url: '/pages/home/index' })
    },
    selectType(type) {
      this.selectedType = type
    },
    goSelected() {
      this.goType(this.selectedType)
    },
    goType(type) {
      if (type === 'houses') {
        this.houseModeVisible = true
        return
      }
      const routeMap = {
        jobs: '/pages/publish-job/index'
      }
      const url = routeMap[type] || `/pages/publish-common/index?type=${encodeURIComponent(type)}`
      uni.navigateTo({
        url,
        fail: () => {
          uni.showToast({ title: '页面路由未刷新，请重新编译运行', icon: 'none' })
        }
      })
    },
    closeHouseMode() {
      this.houseModeVisible = false
    },
    goHousePublish(mode) {
      this.houseModeVisible = false
      const url = mode === 'rent' ? '/pages/publish-rent/index' : '/pages/publish-house/index'
      uni.navigateTo({
        url,
        fail: () => {
          uni.showToast({ title: '页面路由未刷新，请重新编译运行', icon: 'none' })
        }
      })
    }
  }
}
</script>

<style scoped>
.publish-select-page {
  overflow-x: hidden;
  width: 100%;
  min-height: 100vh;
  padding: 24rpx 28rpx 188rpx;
  background:
    radial-gradient(circle at 92% 0, rgba(202, 253, 247, 0.86) 0, rgba(202, 253, 247, 0) 260rpx),
    linear-gradient(180deg, #fbfff5 0%, #ffffff 430rpx, #f8fcf9 100%);
}

.select-shell {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh - 212rpx);
}

.select-nav {
  display: flex;
  align-items: center;
  height: 64rpx;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.select-head {
  margin-top: 34rpx;
}

.select-title {
  display: block;
  color: #132033;
  font-size: 42rpx;
  font-weight: 800;
  line-height: 58rpx;
}

.select-desc {
  display: block;
  margin-top: 8rpx;
  color: #7a8496;
  font-size: 24rpx;
  line-height: 34rpx;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 36rpx;
}

.type-card {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: 0;
  height: 162rpx;
  border: 2rpx solid #e7edf3;
  border-radius: 15rpx;
  background: #ffffff;
  color: #132033;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.03);
}

.type-card.active {
  border-color: #1fc56f;
  background: #ecfff1;
  color: #1fc56f;
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
}

.type-title {
  margin-top: 14rpx;
  max-width: 100%;
  color: inherit;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 36rpx;
  text-align: center;
  white-space: nowrap;
}

.publish-note {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6rpx;
  margin-top: 28rpx;
  margin-bottom: 36rpx;
  color: #8b94a5;
  font-size: 24rpx;
  line-height: 34rpx;
}

.note-action {
  color: #132033;
  font-weight: 700;
}

.select-submit {
  width: 100%;
  height: 94rpx;
  margin-top: auto;
  border-radius: 15rpx;
  background: #1fc56f;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 94rpx;
  text-align: center;
  box-shadow: 0 14rpx 28rpx rgba(31, 197, 111, 0.24);
}

.house-mode-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  align-items: flex-end;
  background: rgba(17, 24, 39, 0.68);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.house-mode-mask.visible {
  opacity: 1;
  pointer-events: auto;
}

.house-mode-sheet {
  width: 100%;
  min-height: 440rpx;
  padding: 52rpx 40rpx calc(42rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
  transform: translateY(100%);
  transition: transform 260ms ease-out;
}

.house-mode-mask.visible .house-mode-sheet {
  transform: translateY(0);
}

.house-mode-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  min-height: 150rpx;
  padding: 28rpx 32rpx;
  border-radius: 18rpx;
}

.house-mode-card--sell {
  background: #fff3e6;
}

.house-mode-card--rent {
  margin-top: 22rpx;
  background: #e9fbf5;
}

.house-mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 108rpx;
  width: 108rpx;
  height: 108rpx;
  border-radius: 34rpx;
}

.house-mode-icon--sell {
  background: linear-gradient(180deg, #ff922f 0%, #ffb24c 100%);
}

.house-mode-icon--rent {
  background: linear-gradient(180deg, #1ccf95 0%, #38e0aa 100%);
}

.house-mode-copy {
  flex: 1;
  min-width: 0;
}

.house-mode-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.house-mode-title {
  color: #111827;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 44rpx;
}

.house-mode-hot {
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 8rpx;
  background: #ff5b3d;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 34rpx;
}

.house-mode-desc {
  display: block;
  margin-top: 10rpx;
  color: #111827;
  font-size: 26rpx;
  line-height: 36rpx;
}

.house-mode-arrow {
  color: #98a2b3;
  font-size: 54rpx;
  font-weight: 700;
}

.house-mode-close {
  width: 72rpx;
  height: 72rpx;
  margin: 34rpx auto 0;
  border-radius: 50%;
  background: #f2f4f7;
  color: #b5bac2;
  font-size: 54rpx;
  line-height: 66rpx;
  text-align: center;
}
</style>
