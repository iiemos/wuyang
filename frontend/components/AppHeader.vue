<template>
  <view class="app-header" :class="{ 'app-header--back': back }">
    <view v-if="back" class="back tap" @tap="goBack">
      <AppIcon name="lucide:chevron-left" color="#1A1A1A" size="44rpx" />
    </view>
    <view class="copy">
      <text class="title">{{ title }}</text>
      <text v-if="subtitle && !back" class="subtitle">{{ subtitle }}</text>
    </view>
    <view v-if="!back" class="slot">
      <slot />
    </view>
  </view>
</template>

<script>
import AppIcon from './AppIcon.vue'

export default {
  components: { AppIcon },
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    back: { type: Boolean, default: false }
  },
  methods: {
    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  gap: 16rpx;
}

.app-header--back {
  position: relative;
  justify-content: center;
  min-height: 88rpx;
  gap: 0;
}

.back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  color: #1a1a1a;
  line-height: 1;
}

.app-header--back .back {
  position: absolute;
  top: 12rpx;
  left: 0;
  z-index: 2;
}

.copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.app-header--back .copy {
  position: absolute;
  right: 120rpx;
  left: 120rpx;
  align-items: center;
}

.title {
  color: #1a1a1a;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 54rpx;
}

.app-header--back .title {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 48rpx;
  text-align: center;
}

.subtitle {
  margin-top: 4rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 34rpx;
}

.slot {
  display: flex;
  align-items: center;
}
</style>
