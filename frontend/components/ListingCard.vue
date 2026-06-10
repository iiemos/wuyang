<template>
  <view :class="listingClass" @tap="openDetail">
    <template v-if="isStandard">
      <view class="standard-head">
        <text class="standard-title">{{ item.title }}</text>
        <text class="standard-side">{{ standardSideText }}</text>
      </view>
      <text class="standard-summary">{{ item.summary }}</text>
      <view class="standard-tags">
        <text v-for="chip in standardChips" :key="chip" class="standard-tag">{{ chip }}</text>
      </view>
      <view class="standard-bottom">
        <view class="standard-logo">{{ standardLogoText }}</view>
        <view class="standard-main">
          <view class="standard-line">
            <text class="standard-name">{{ standardContactText }}</text>
            <text class="standard-verify">{{ item.tag || typeLabel }}</text>
          </view>
          <text class="standard-address">{{ standardAddressText }}</text>
        </view>
        <view class="standard-action tap" @tap.stop="standardAction">{{ standardActionText }}</view>
      </view>
    </template>
    <template v-else>
      <view class="cover">
        <image v-if="firstImage" class="cover-image" :src="firstImage" mode="aspectFill" />
        <AppIcon v-else :name="iconName" color="#FFFFFF" size="56rpx" />
      </view>
      <view class="main">
        <view class="topline">
          <text class="title">{{ item.title }}</text>
          <text class="tag">{{ item.tag }}</text>
        </view>
        <text class="summary line-clamp-2">{{ item.summary }}</text>
        <view class="chips">
          <text v-for="chip in chips" :key="chip" class="chip">{{ chip }}</text>
        </view>
        <view class="meta">
          <text class="meta-text">{{ item.address }}</text>
          <text class="meta-text">{{ item.time }}</text>
        </view>
        <view class="bottom">
          <text class="price">{{ item.price }}</text>
          <view class="contact tap" @tap.stop="contact">联系</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import AppIcon from './AppIcon.vue'

export default {
  components: { AppIcon },
  props: {
    item: { type: Object, required: true },
    type: { type: String, required: true },
    variant: { type: String, default: 'media' }
  },
  computed: {
    isStandard() {
      return this.variant === 'standard'
    },
    iconName() {
      const map = {
        jobs: 'lucide:job-tie',
        houses: 'lucide:house-market',
        convenience: 'lucide:hand-heart',
        yellowPages: 'lucide:service-paint',
        secondhand: 'lucide:secondhand-clothes',
        news: 'lucide:newspaper'
      }
      return map[this.type] || 'lucide:map-pin'
    },
    firstImage() {
      return Array.isArray(this.item.images) && this.item.images.length ? this.item.images[0] : ''
    },
    listingClass() {
      return `listing card tap listing--${this.type} listing--${this.variant}`
    },
    chips() {
      return Array.isArray(this.item.highlights) ? this.item.highlights.slice(0, 3) : []
    },
    standardChips() {
      const chips = Array.isArray(this.item.highlights) ? this.item.highlights.slice() : []
      if (this.item.tag) chips.unshift(this.item.tag)
      return this.uniqueList(chips).slice(0, 4)
    },
    standardSideText() {
      if (this.type === 'news') return this.item.tag || '资讯'
      return this.item.price || this.item.tag || '面议'
    },
    standardContactText() {
      return this.item.contact || this.item.author || this.item.source || '本地用户'
    },
    standardLogoText() {
      return this.standardContactText ? this.standardContactText.slice(0, 1) : '本'
    },
    standardAddressText() {
      const address = this.item.address || '本地'
      return this.item.time ? `${address} · ${this.item.time}` : address
    },
    standardActionText() {
      return this.type === 'news' ? '查看' : '联系'
    },
    typeLabel() {
      const map = {
        jobs: '招聘求职',
        houses: '房源',
        convenience: '便民信息',
        yellowPages: '商家服务',
        secondhand: '二手闲置',
        news: '本地资讯'
      }
      return map[this.type] || '本地信息'
    }
  },
  methods: {
    openDetail() {
      const preview = this.item.previewToken ? `&previewToken=${encodeURIComponent(this.item.previewToken)}` : ''
      uni.navigateTo({ url: `/pages/detail/index?type=${this.type}&id=${this.item.id}${preview}` })
    },
    contact() {
      uni.showToast({ title: `联系 ${this.item.contact}`, icon: 'none' })
    },
    standardAction() {
      this.openDetail()
    },
    uniqueList(source) {
      return source
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item, index, list) => item && list.indexOf(item) === index)
    }
  }
}
</script>

<style scoped>
.listing {
  display: flex;
  gap: 20rpx;
  position: relative;
  overflow: hidden;
  padding: 24rpx;
}

.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 112rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #45e981 0%, #9cf64f 100%);
  color: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(87, 220, 79, 0.3);
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.topline,
.bottom,
.meta {
  display: flex;
  align-items: center;
}

.topline {
  gap: 12rpx;
}

.title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #1a1a1a;
  font-size: 33rpx;
  font-weight: 700;
  line-height: 42rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary {
  margin-top: 8rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 36rpx;
}

.chips {
  display: flex;
  gap: 10rpx;
  margin-top: 14rpx;
  overflow: hidden;
}

.chip {
  flex: 0 0 auto;
  height: 38rpx;
  padding: 0 14rpx;
  border-radius: 18rpx;
  background: #fff6eb;
  color: #ff8a1f;
  font-size: 22rpx;
  line-height: 38rpx;
}

.meta {
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 14rpx;
  color: #999999;
  font-size: 24rpx;
  line-height: 32rpx;
}

.meta-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom {
  justify-content: space-between;
  margin-top: 14rpx;
}

.price {
  flex: 1;
  min-width: 0;
  color: #ff9f29;
  font-size: 30rpx;
  font-weight: 700;
}

.contact {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin-left: auto;
  margin-right: 0;
  min-width: 112rpx;
  height: 56rpx;
  border-radius: 15rpx;
  background: #20c95a;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 56rpx;
  box-shadow: 0 8rpx 18rpx rgba(32, 201, 90, 0.24);
}

.listing--houses .cover {
  background: linear-gradient(135deg, #ffb04a 0%, #ffdf75 100%);
}

.listing--yellowPages .cover {
  background: linear-gradient(135deg, #64d8ff 0%, #7af6d9 100%);
}

.listing--secondhand .cover {
  background: linear-gradient(135deg, #b9a8ff 0%, #79d9ff 100%);
}

.listing--news .cover {
  background: linear-gradient(135deg, #cfd4ff 0%, #8f96ff 100%);
}

.listing--standard {
  display: block;
  gap: 0;
  padding: 30rpx 28rpx;
  border: 0;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.05);
}

.standard-head {
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
  line-height: 34rpx;
  white-space: nowrap;
}

.standard-bottom {
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
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-verify {
  flex: 0 0 auto;
  height: 30rpx;
  padding: 0 10rpx;
  border-radius: 8rpx;
  background: #ecfdf3;
  color: #12b76a;
  font-size: 18rpx;
  line-height: 30rpx;
}

.standard-address {
  display: block;
  overflow: hidden;
  margin-top: 2rpx;
  color: #8a94a6;
  font-size: 21rpx;
  line-height: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 104rpx;
  width: 104rpx;
  height: 52rpx;
  border-radius: 15rpx;
  background: #1fc56f;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 52rpx;
  box-shadow: 0 8rpx 18rpx rgba(31, 197, 111, 0.2);
}
</style>
