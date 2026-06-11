<template>
  <view class="app-page house-publish-page">
    <view class="house-hero">
      <view class="hero-soft-shape"></view>
      <view class="house-nav">
        <view class="house-back tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#FFFFFF" size="46rpx" />
        </view>
      </view>
      <view class="hero-buildings">
        <view class="building building-a"></view>
        <view class="building building-b"></view>
        <view class="building building-c"></view>
      </view>
      <text class="hero-title">快速卖房</text>
      <text class="hero-subtitle">多数房东选择在平台发房</text>
      <view class="hero-badges">
        <view class="hero-badge">
          <text class="badge-check">✓</text>
          <text>信息隐私保护</text>
        </view>
        <view class="hero-badge">
          <text class="badge-check">✓</text>
          <text>多平台同步展示</text>
        </view>
        <view class="hero-badge">
          <text class="badge-check">✓</text>
          <text>海量找房用户</text>
        </view>
      </view>
    </view>

    <view class="house-card main-card">
      <view class="house-row">
        <text class="row-label">小区</text>
        <view class="row-main">
          <input v-model="form.community" class="row-input strong" placeholder="请输入小区名称" />
          <text class="row-helper">近7天有12位用户浏览该小区</text>
        </view>
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row">
        <text class="row-label">楼栋号</text>
        <input v-model="form.buildingNo" class="row-input strong" placeholder="请填写楼栋号" />
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row">
        <text class="row-label">面积</text>
        <input v-model="form.area" class="row-input" type="digit" placeholder="需与产证面积一致" />
        <text class="row-unit">m²</text>
      </view>
      <view class="house-row tap" @tap="openHousePicker('layout')">
        <text class="row-label">户型</text>
        <text class="row-value" :class="{ placeholder: !form.layout }">{{ form.layout || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row tap" @tap="openHousePicker('floor')">
        <text class="row-label">楼层</text>
        <text class="row-value" :class="{ placeholder: !floorText }">{{ floorText || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row tap" @tap="openHousePicker('orientation')">
        <text class="row-label">朝向</text>
        <text class="row-value" :class="{ placeholder: !form.orientation }">{{ form.orientation || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row tap" @tap="openHousePicker('decoration')">
        <text class="row-label">装修</text>
        <text class="row-value">{{ form.decoration }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row tap" @tap="openHousePicker('houseType')">
        <text class="row-label">房屋类型</text>
        <text class="row-value">{{ form.houseType }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="house-row price-row">
        <text class="row-label">期望售价</text>
        <input v-model="form.expectedPrice" class="row-input" type="digit" placeholder="请输入" />
        <text class="row-unit">万元</text>
      </view>
      <view class="house-row photo-link">
        <text class="row-label">照片</text>
        <view class="row-main">
          <text class="row-value" :class="{ placeholder: !hasHouseImages }">{{ hasHouseImages ? photoCountText : '请选择' }}</text>
          <text class="row-helper">如未准备好照片，提交表单后再上传</text>
        </view>
        <text class="row-arrow">›</text>
      </view>
    </view>

    <!-- <view class="house-card broker-card tap" @tap="toggleBroker">
      <view class="broker-check" :class="{ active: brokerEnabled }">✓</view>
      <view class="broker-main">
        <view class="broker-title">
          <text>经纪人帮卖</text>
          <text class="broker-info">i</text>
          <text class="broker-percent">95%</text>
          <text>的房东已开启帮卖</text>
        </view>
        <text class="broker-desc">多人帮找买家 | 线上线下带看 | 在线秒回买家</text>
      </view>
    </view> -->

    <view class="house-card contact-card">
      <text class="section-title">联系方式</text>
      <view class="house-row contact-row">
        <text class="row-label">联系人</text>
        <input v-model="form.contact" class="row-input" placeholder="请输入联系人" />
      </view>
      <view class="house-row contact-row">
        <text class="row-label">联系电话</text>
        <input v-model="form.phone" class="row-input" type="number" placeholder="用于买家联系" />
      </view>
    </view>

    <view class="photo-card">
      <view class="photo-section">
        <view class="photo-title-row">
          <text class="required-star">*</text>
          <text class="photo-title">室内图</text>
          <text class="photo-subtitle">上传卧室、客厅、卫生间等</text>
          <text class="photo-example">错误示例</text>
        </view>
        <view class="photo-grid">
          <view v-for="(image, index) in photoGroups.indoor" :key="image" class="photo-item">
            <image class="photo-img" :src="image" mode="aspectFill" />
            <view class="photo-remove tap" @tap="removeHouseImage('indoor', index)">×</view>
          </view>
          <view v-if="photoGroups.indoor.length < 1" class="photo-add tap" :class="{ disabled: uploading }" @tap="chooseHouseImages('indoor')">
            <AppIcon name="lucide:square-plus" color="#9AA0A6" size="54rpx" />
            <text>添加照片</text>
          </view>
        </view>
        <text class="photo-note">注意事项：</text>
        <text class="photo-note">1.请勿上传带有水印、其他网站logo的图片</text>
        <text class="photo-note">2.请勿上传出现人物、联系方式或与房源无关图片</text>
      </view>

      <view class="photo-section">
        <view class="photo-title-row">
          <text class="photo-title">户型图</text>
          <text class="photo-subtitle">最多3张</text>
        </view>
        <view class="photo-grid">
          <view v-for="(image, index) in photoGroups.floorPlan" :key="image" class="photo-item">
            <image class="photo-img" :src="image" mode="aspectFill" />
            <view class="photo-remove tap" @tap="removeHouseImage('floorPlan', index)">×</view>
          </view>
          <view v-if="photoGroups.floorPlan.length < 3" class="photo-add tap" :class="{ disabled: uploading }" @tap="chooseHouseImages('floorPlan')">
            <AppIcon name="lucide:square-plus" color="#9AA0A6" size="54rpx" />
            <text>添加照片</text>
          </view>
        </view>
      </view>

      <view class="photo-section">
        <view class="photo-title-row">
          <text class="photo-title">室外图</text>
          <text class="photo-subtitle">最多10张,对外默认展示前3张(图片需包含楼栋)</text>
        </view>
        <view class="photo-grid">
          <view v-for="(image, index) in photoGroups.outdoor" :key="image" class="photo-item">
            <image class="photo-img" :src="image" mode="aspectFill" />
            <view class="photo-remove tap" @tap="removeHouseImage('outdoor', index)">×</view>
          </view>
          <view v-if="photoGroups.outdoor.length < 10" class="photo-add tap" :class="{ disabled: uploading }" @tap="chooseHouseImages('outdoor')">
            <AppIcon name="lucide:square-plus" color="#9AA0A6" size="54rpx" />
            <text>添加照片</text>
          </view>
        </view>
      </view>
    </view>

    <view class="house-submit tap" :class="{ disabled: submitting }" @tap="submit">
      {{ submitting ? '提交中' : '提交' }}
    </view>
    <view class="agreement-row tap" @tap="toggleAgreement">
      <view class="agreement-check" :class="{ active: agreementAccepted }">✓</view>
      <text>我已阅读并接受</text>
      <text class="agreement-link">《出售房源信息发布及交易服务协议》</text>
    </view>

    <view class="house-picker-mask" :class="{ visible: pickerVisible }" @tap="closeHousePicker">
      <view class="house-picker-sheet" @tap.stop>
        <view class="house-picker-head">
          <view class="picker-cancel tap" @tap="closeHousePicker">取消</view>
          <text>{{ activePickerTitle }}</text>
          <view class="picker-done tap" @tap="closeHousePicker">确定</view>
        </view>
        <picker-view v-if="activePickerKey === 'layout'" class="house-wheel" :value="layoutPickerValue" indicator-style="height: 72rpx;" @change="onLayoutChange">
          <picker-view-column>
            <view v-for="item in roomOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="item in hallOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="item in bathOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
        </picker-view>
        <picker-view v-else-if="activePickerKey === 'floor'" class="house-wheel" :value="floorPickerValue" indicator-style="height: 72rpx;" @change="onFloorChange">
          <picker-view-column>
            <view v-for="item in floorOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="item in totalFloorOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
        </picker-view>
        <scroll-view v-else scroll-y class="house-choice-scroll">
          <view class="house-choice-grid">
            <view
              v-for="item in activeChoiceOptions"
              :key="item"
              class="house-choice tap"
              :class="{ active: activeChoiceValue === item }"
              @tap="selectHouseChoice(item)"
            >
              {{ item }}
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'
import { createListing, uploadImage } from '../../utils/api'

function createRange(prefix, start, end, suffix) {
  const items = []
  for (let value = start; value <= end; value += 1) items.push(`${prefix}${value}${suffix}`)
  return items
}

function createEmptyHouseForm() {
  return {
    community: '建业城',
    buildingNo: '',
    area: '',
    layout: '',
    currentFloor: '1层',
    totalFloor: '共1层',
    orientation: '',
    decoration: '简单装修',
    houseType: '普通住宅',
    expectedPrice: '',
    contact: '',
    phone: ''
  }
}

function createEmptyPhotoGroups() {
  return {
    indoor: [],
    floorPlan: [],
    outdoor: []
  }
}

const photoLimits = {
  indoor: 1,
  floorPlan: 3,
  outdoor: 10
}

export default {
  components: { AppIcon },
  data() {
    return {
      form: createEmptyHouseForm(),
      photoGroups: createEmptyPhotoGroups(),
      uploading: false,
      submitting: false,
      brokerEnabled: true,
      agreementAccepted: true,
      pickerVisible: false,
      activePickerKey: '',
      layoutPickerValue: [1, 1, 1],
      floorPickerValue: [3, 0],
      roomOptions: createRange('', 1, 8, '室'),
      hallOptions: createRange('', 0, 5, '厅'),
      bathOptions: createRange('', 0, 5, '卫'),
      floorOptions: ['-3层', '-2层', '-1层'].concat(createRange('', 1, 60, '层')),
      totalFloorOptions: createRange('共', 1, 60, '层'),
      choiceOptions: {
        orientation: ['东', '南', '西', '北', '南北', '东西', '东南', '西南', '东北', '西北'],
        decoration: ['毛坯', '简单装修', '精装修', '豪华装修'],
        houseType: ['普通住宅', '公寓', '别墅', '平房', '商住楼', '其他']
      }
    }
  },
  computed: {
    floorText() {
      return this.form.currentFloor && this.form.totalFloor ? `${this.form.currentFloor} / ${this.form.totalFloor}` : ''
    },
    houseImages() {
      return this.photoGroups.indoor.concat(this.photoGroups.floorPlan).concat(this.photoGroups.outdoor)
    },
    hasHouseImages() {
      return this.houseImages.length > 0
    },
    photoCountText() {
      return `${this.houseImages.length}张`
    },
    activePickerTitle() {
      const titles = {
        layout: '户型',
        floor: '楼层',
        orientation: '朝向',
        decoration: '装修',
        houseType: '房屋类型'
      }
      return titles[this.activePickerKey] || '请选择'
    },
    activeChoiceOptions() {
      return this.choiceOptions[this.activePickerKey] || []
    },
    activeChoiceValue() {
      return this.form[this.activePickerKey] || ''
    }
  },
  methods: {
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/publish/index?type=houses' })
    },
    openHousePicker(key) {
      this.activePickerKey = key
      if (key === 'layout') this.syncLayoutPicker()
      if (key === 'floor') this.syncFloorPicker()
      this.pickerVisible = true
    },
    closeHousePicker() {
      this.pickerVisible = false
    },
    syncLayoutPicker() {
      const match = /^(\d+室)(\d+厅)(\d+卫)$/.exec(this.form.layout || '')
      if (!match) {
        this.layoutPickerValue = [1, 1, 1]
        this.form.layout = '2室1厅1卫'
        return
      }
      this.layoutPickerValue = [
        this.roomOptions.indexOf(match[1]),
        this.hallOptions.indexOf(match[2]),
        this.bathOptions.indexOf(match[3])
      ].map((index) => (index > -1 ? index : 0))
    },
    syncFloorPicker() {
      const currentIndex = this.floorOptions.indexOf(this.form.currentFloor)
      const totalIndex = this.totalFloorOptions.indexOf(this.form.totalFloor)
      this.floorPickerValue = [currentIndex > -1 ? currentIndex : 3, totalIndex > -1 ? totalIndex : 0]
    },
    onLayoutChange(event) {
      const value = event.detail && event.detail.value ? event.detail.value : [0, 0, 0]
      this.layoutPickerValue = value
      this.form.layout = `${this.roomOptions[value[0]]}${this.hallOptions[value[1]]}${this.bathOptions[value[2]]}`
    },
    onFloorChange(event) {
      const value = event.detail && event.detail.value ? event.detail.value : [0, 0]
      this.floorPickerValue = value
      this.form.currentFloor = this.floorOptions[value[0]]
      this.form.totalFloor = this.totalFloorOptions[value[1]]
    },
    selectHouseChoice(value) {
      this.form[this.activePickerKey] = value
    },
    chooseHouseImages(group) {
      const limit = photoLimits[group] || 0
      const current = this.photoGroups[group] || []
      const count = limit - current.length
      if (count <= 0 || this.uploading) return
      uni.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          this.uploading = true
          const paths = res.tempFilePaths || []
          try {
            for (let index = 0; index < paths.length; index += 1) {
              const data = await uploadImage(paths[index])
              if (data && data.url && this.photoGroups[group].length < limit) this.photoGroups[group].push(data.url)
            }
          } catch (error) {
            uni.showToast({ title: (error && error.message) || '图片上传失败', icon: 'none' })
          } finally {
            this.uploading = false
          }
        }
      })
    },
    removeHouseImage(group, index) {
      this.photoGroups[group].splice(index, 1)
    },
    toggleBroker() {
      this.brokerEnabled = !this.brokerEnabled
    },
    toggleAgreement() {
      this.agreementAccepted = !this.agreementAccepted
    },
    buildSummary() {
      return [
        `小区：${this.form.community || '未填写'}`,
        `面积：${this.form.area || '未填写'}m²`,
        `户型：${this.form.layout || '未选择'}`,
        `楼层：${this.floorText || '未选择'}`,
        `朝向：${this.form.orientation || '未选择'}`,
        `装修：${this.form.decoration}`,
        `房屋类型：${this.form.houseType}`,
        `经纪人帮卖：${this.brokerEnabled ? '已开启' : '未开启'}`
      ].join('\n')
    },
    resetForm() {
      this.form = createEmptyHouseForm()
      this.photoGroups = createEmptyPhotoGroups()
      this.brokerEnabled = true
      this.agreementAccepted = true
    },
    async submit() {
      if (this.submitting) return
      if (!this.form.community || !this.form.area || !this.form.layout || !this.form.expectedPrice || !this.form.contact || !this.form.phone) {
        uni.showToast({ title: '请完善小区、面积、户型、售价和联系方式', icon: 'none' })
        return
      }
      if (!this.agreementAccepted) {
        uni.showToast({ title: '请先阅读并接受协议', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const title = `${this.form.community} ${this.form.layout}`
        const payload = {
          type: 'houses',
          title,
          tag: '出售',
          price: `${this.form.expectedPrice}万元`,
          address: this.form.community,
          contact: this.form.contact,
          phone: this.form.phone,
          summary: this.buildSummary(),
          highlights: [
            `${this.form.area}m²`,
            this.form.layout,
            this.floorText,
            this.form.orientation,
            this.form.decoration,
            this.form.houseType
          ].filter((item) => item).map((item) => item.slice(0, 20)).slice(0, 6),
          details: {
            saleType: '出售',
            community: this.form.community,
            buildingNo: this.form.buildingNo,
            area: `${this.form.area}m²`,
            layout: this.form.layout,
            floor: this.floorText,
            orientation: this.form.orientation,
            decoration: this.form.decoration,
            houseType: this.form.houseType,
            expectedPrice: `${this.form.expectedPrice}万元`,
            brokerEnabled: this.brokerEnabled
          },
          images: this.houseImages
        }
        const data = await createListing(payload)
        uni.setStorageSync('lastPublishRecord', data)
        this.savePreviewToken(data.id, data.previewToken)
        const targetUrl = `/pages/detail/index?type=houses&id=${encodeURIComponent(data.id)}`
        this.resetForm()
        uni.showToast({ title: '已提交审核', icon: 'none' })
        setTimeout(() => {
          uni.redirectTo({ url: targetUrl })
        }, 400)
      } catch (error) {
        uni.showToast({ title: (error && error.message) || '提交失败，请稍后重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    savePreviewToken(id, token) {
      if (!id || !token) return
      const tokens = uni.getStorageSync('listingPreviewTokens') || {}
      tokens[id] = token
      uni.setStorageSync('listingPreviewTokens', tokens)
    }
  }
}
</script>

<style scoped>
.house-publish-page {
  overflow-x: hidden;
  min-height: 100vh;
  padding: 0 22rpx 32rpx;
  background: #f4f7fb;
}

.house-hero {
  position: relative;
  overflow: hidden;
  margin: 0 -22rpx;
  min-height: 410rpx;
  padding: calc(32rpx + env(safe-area-inset-top)) 42rpx 42rpx;
  background: linear-gradient(155deg, #11c9a3 0%, #18b98c 52%, #8ce7c9 100%);
  color: #ffffff;
}

.hero-soft-shape {
  position: absolute;
  top: -80rpx;
  left: -80rpx;
  width: 250rpx;
  height: 250rpx;
  border-radius: 0 0 80rpx 0;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(15deg);
}

.house-nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 76rpx;
}

.house-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
}

.hero-title,
.hero-subtitle {
  position: relative;
  z-index: 2;
  display: block;
  text-align: center;
}

.hero-title {
  margin-top: 34rpx;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 64rpx;
}

.hero-subtitle {
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.hero-badges {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 28rpx;
}

.hero-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 32rpx;
  white-space: nowrap;
}

.badge-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #19bc91;
  font-size: 20rpx;
  line-height: 28rpx;
}

.hero-buildings {
  position: absolute;
  right: 0;
  bottom: 24rpx;
  width: 230rpx;
  height: 170rpx;
  opacity: 0.28;
}

.building {
  position: absolute;
  bottom: 0;
  border-radius: 10rpx 10rpx 0 0;
  background: rgba(255, 255, 255, 0.5);
}

.building-a {
  right: 20rpx;
  width: 82rpx;
  height: 132rpx;
}

.building-b {
  right: 92rpx;
  width: 72rpx;
  height: 98rpx;
}

.building-c {
  right: 150rpx;
  width: 54rpx;
  height: 72rpx;
}

.house-card {
  border-radius: 16rpx;
  background: #ffffff;
}

.main-card {
  position: relative;
  z-index: 3;
  margin-top: -44rpx;
  padding: 22rpx 24rpx 8rpx;
}

.house-row {
  display: flex;
  align-items: center;
  min-height: 104rpx;
  border-bottom: 2rpx solid #edf0f3;
  color: #111827;
}

.photo-link {
  min-height: 126rpx;
  border-bottom: 0;
}

.row-label {
  flex: 0 0 176rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
}

.row-main {
  flex: 1;
  min-width: 0;
}

.row-input {
  flex: 1;
  min-width: 0;
  height: 86rpx;
  color: #111827;
  font-size: 30rpx;
  line-height: 86rpx;
}

.row-input.strong {
  font-weight: 700;
}

.row-value {
  overflow: hidden;
  flex: 1;
  min-width: 0;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-value.placeholder {
  color: #9aa0a6;
  font-weight: 500;
}

.row-helper {
  display: block;
  margin-top: 4rpx;
  color: #646b76;
  font-size: 26rpx;
  line-height: 36rpx;
}

.row-arrow,
.row-unit {
  flex: 0 0 auto;
  color: #9aa0a6;
  font-size: 44rpx;
  font-weight: 700;
}

.row-unit {
  color: #111827;
  font-size: 30rpx;
}

.price-row {
  border-bottom: 0;
}

.price-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  width: 430rpx;
  max-width: calc(100% - 176rpx);
  height: 46rpx;
  margin: -10rpx 0 20rpx 176rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #ffe3cd;
  color: #9b5b2b;
  font-size: 24rpx;
  font-weight: 700;
}

.price-tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30rpx;
  height: 30rpx;
  border-radius: 8rpx;
  background: #9b5b2b;
  color: #ffffff;
  font-size: 20rpx;
}

.broker-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 22rpx;
  padding: 26rpx 28rpx;
}

.broker-check,
.agreement-check {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  background: #d7f7ea;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 800;
}

.broker-check {
  flex: 0 0 34rpx;
  width: 34rpx;
  height: 34rpx;
  margin-top: 4rpx;
}

.broker-check.active,
.agreement-check.active {
  background: #28c890;
}

.broker-main {
  flex: 1;
  min-width: 0;
}

.broker-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 42rpx;
}

.broker-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid #a0a7b3;
  border-radius: 50%;
  color: #a0a7b3;
  font-size: 20rpx;
  line-height: 28rpx;
}

.broker-percent {
  color: #28c890;
  font-weight: 500;
}

.broker-desc {
  display: block;
  margin-top: 10rpx;
  color: #555f6d;
  font-size: 25rpx;
  line-height: 36rpx;
}

.contact-card,
.photo-card {
  margin-top: 22rpx;
  padding: 26rpx 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.section-title {
  display: block;
  margin-bottom: 10rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.contact-row:last-child {
  border-bottom: 0;
}

.photo-section {
  padding: 8rpx 0 36rpx;
}

.photo-section:last-child {
  padding-bottom: 0;
}

.photo-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  color: #111827;
  line-height: 42rpx;
}

.required-star {
  color: #ff4d4f;
  font-size: 24rpx;
  font-weight: 800;
}

.photo-title {
  font-size: 34rpx;
  font-weight: 800;
}

.photo-subtitle {
  color: #111827;
  font-size: 25rpx;
}

.photo-example {
  margin-left: auto;
  color: #2455d6;
  font-size: 25rpx;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 18rpx;
}

.photo-add,
.photo-item {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 220rpx;
  height: 220rpx;
  border-radius: 6rpx;
  background: #f0f3f8;
  color: #9aa0a6;
  font-size: 28rpx;
  font-weight: 700;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.62);
  color: #ffffff;
  font-size: 30rpx;
  line-height: 38rpx;
  text-align: center;
}

.photo-note {
  display: block;
  margin-top: 10rpx;
  color: #9aa0a6;
  font-size: 25rpx;
  line-height: 36rpx;
}

.house-submit {
  height: 94rpx;
  margin-top: 24rpx;
  border-radius: 15rpx;
  background: #28c890;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 94rpx;
  text-align: center;
}

.house-submit.disabled,
.photo-add.disabled {
  opacity: 0.58;
}

.agreement-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 20rpx;
  color: #9aa0a6;
  font-size: 25rpx;
  line-height: 36rpx;
}

.agreement-check {
  width: 30rpx;
  height: 30rpx;
  font-size: 22rpx;
}

.agreement-link {
  color: #2455d6;
}

.house-picker-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.52);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.house-picker-mask.visible {
  opacity: 1;
  pointer-events: auto;
}

.house-picker-sheet {
  width: 100%;
  min-height: 40vh;
  padding: 0 32rpx calc(46rpx + env(safe-area-inset-bottom));
  border-radius: 18rpx 18rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
  transform: translateY(100%);
  transition: transform 260ms ease-out;
}

.house-picker-mask.visible .house-picker-sheet {
  transform: translateY(0);
}

.house-picker-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.picker-cancel,
.picker-done {
  position: absolute;
  top: 0;
  height: 100rpx;
  color: #555f6d;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 100rpx;
}

.picker-cancel {
  left: 0;
}

.picker-done {
  right: 0;
  color: #18b98c;
}

.house-wheel {
  width: 100%;
  height: 430rpx;
}

.wheel-item {
  height: 72rpx;
  color: #111827;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 72rpx;
  text-align: center;
}

.house-choice-scroll {
  max-height: 620rpx;
}

.house-choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx;
  padding-top: 36rpx;
}

.house-choice {
  height: 66rpx;
  border: 2rpx solid #cfd5dc;
  border-radius: 8rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 66rpx;
  text-align: center;
}

.house-choice.active {
  border-color: #28c890;
  background: #ecfff6;
  color: #18b98c;
}
</style>
