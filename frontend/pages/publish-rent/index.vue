<template>
  <view class="app-page rent-publish-page">
    <view class="rent-nav">
      <view class="rent-back tap" @tap="goBack">
        <AppIcon name="lucide:chevron-left" color="#111827" size="42rpx" />
      </view>
      <text class="rent-nav-title">整租发布</text>
    </view>

    <view class="rent-hero">
      <view class="rent-buildings">
        <view class="rent-building rent-building-a"></view>
        <view class="rent-building rent-building-b"></view>
      </view>
      <text class="rent-hero-title">轻轻松松，上架房源</text>
    </view>

    <view class="rent-mode-card">
      <text class="required-star">*</text>
      <text class="mode-label">出租方式</text>
      <view class="mode-tabs">
        <view class="mode-tab active">整套出租</view>
      </view>
    </view>

    <view class="rent-card">
      <text class="card-title">基础信息</text>
      <view class="rent-row">
        <text class="required-star">*</text>
        <text class="row-label">所在城市</text>
        <text class="row-value">漯河</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row">
        <text class="required-star">*</text>
        <text class="row-label">所在小区</text>
        <input v-model="form.community" class="row-input" placeholder="请填写" />
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row">
        <text class="required-star">*</text>
        <text class="row-label">房屋面积</text>
        <input v-model="form.area" class="row-input" type="digit" placeholder="若不清楚，可填大概" />
        <text class="row-unit">m²</text>
      </view>
      <view class="rent-row tap" @tap="openRentPicker('layout')">
        <text class="required-star">*</text>
        <text class="row-label">房屋户型</text>
        <text class="row-value" :class="{ placeholder: !form.layout }">{{ form.layout || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row tap" @tap="openRentPicker('orientation')">
        <text class="required-star">*</text>
        <text class="row-label">房屋朝向</text>
        <text class="row-value" :class="{ placeholder: !form.orientation }">{{ form.orientation || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row tap" @tap="openRentPicker('moveInTime')">
        <text class="required-star">*</text>
        <text class="row-label">入住时间</text>
        <text class="row-value" :class="{ placeholder: !form.moveInTime }">{{ form.moveInTime || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row">
        <text class="required-star">*</text>
        <text class="row-label">期望租金</text>
        <input v-model="form.rent" class="row-input rent-input" type="digit" placeholder="优先填写小区+户型+面积，显示房源初级估价" />
        <text class="row-unit">元/月</text>
      </view>
      <view class="rent-row tap" @tap="openRentPicker('paymentMethod')">
        <text class="required-star">*</text>
        <text class="row-label">付款方式</text>
        <text class="row-value" :class="{ placeholder: !form.paymentMethod }">{{ form.paymentMethod || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
    </view>

    <view class="rent-card">
      <view class="section-title-row">
        <text class="card-title">展示信息</text>
        <text class="boost-tip">补充以下信息，房源曝光提升30%</text>
      </view>
      <view class="display-block">
        <view class="display-title-row">
          <text class="display-title">房源图片</text>
          <text class="display-link">图片规范 ›</text>
        </view>
        <text class="display-desc">遵守图片上传规范，杜绝房源下架风险</text>
        <view class="rent-image-grid">
          <view v-for="(image, index) in form.images" :key="image" class="rent-image-item">
            <image class="rent-image" :src="image" mode="aspectFill" />
            <view class="image-remove tap" @tap="removeImage(index)">×</view>
          </view>
          <view v-if="form.images.length < 4" class="rent-image-add tap" :class="{ disabled: uploading }" @tap="chooseImages">
            <AppIcon name="lucide:square-plus" color="#111827" size="54rpx" />
            <text>{{ imageText }}</text>
          </view>
        </view>
      </view>

      <view class="display-block">
        <text class="display-title">房源标签</text>
        <text class="display-desc">丰富信息，可以更快的找到合适租客</text>
        <view class="tag-box">
          <AppIcon name="lucide:house" color="#4b5563" size="42rpx" />
          <text class="tag-box-copy">补充符合你房屋的标签（{{ form.tags.length }}/27）</text>
          <view class="tag-action tap" @tap="toggleDefaultTag">补充 ›</view>
        </view>
      </view>

      <view class="display-block">
        <view class="display-title-row">
          <text class="display-title">房源描述</text>
          <text class="display-link">填写规范 ›</text>
        </view>
        <textarea v-model="form.description" class="desc-textarea" maxlength="300" placeholder="遵守房源描述规范，杜绝房源下架风险" />
        <text class="desc-count">{{ descriptionCount }}/300</text>
      </view>
    </view>

    <view class="rent-card">
      <view class="section-title-row">
        <text class="card-title">平台验真</text>
        <text class="boost-tip">以下信息仅用于验真，不对外展示</text>
      </view>
      <view class="rent-row">
        <text class="row-label verify-label">楼栋号</text>
        <input v-model="form.buildingNo" class="row-input" placeholder="请填写" />
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row floor-row" @tap="openRentPicker('floor')">
        <text class="row-label verify-label">楼层</text>
        <text class="row-value" :class="{ placeholder: !form.currentFloor }">{{ form.currentFloor || '请选择' }}</text>
        <text class="floor-unit">层</text>
        <text class="row-label total-floor-label">总楼层</text>
        <text class="row-value" :class="{ placeholder: !form.totalFloor }">{{ form.totalFloor || '请选择' }}</text>
        <text class="floor-unit">层</text>
      </view>
    </view>

    <view class="rent-card">
      <text class="card-title">其他信息</text>
      <view class="rent-row tap" @tap="openRentPicker('viewingTime')">
        <text class="row-label other-label">看房时间</text>
        <text class="row-value">{{ form.viewingTime }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row tap" @tap="openRentPicker('feeIncluded')">
        <text class="row-label other-label">费用包含</text>
        <text class="row-value" :class="{ placeholder: !form.feeIncluded }">{{ form.feeIncluded || '请选择' }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="rent-row tap last-row" @tap="openRentPicker('ownerType')">
        <text class="row-label other-label">房东身份</text>
        <text class="row-value">{{ form.ownerType }}</text>
        <text class="row-arrow">›</text>
      </view>
    </view>

    <view class="rent-card contact-card">
      <text class="card-title">联系信息</text>
      <view class="rent-row">
        <text class="row-label other-label">联系人</text>
        <input v-model="form.contact" class="row-input" placeholder="请填写" />
      </view>
      <view class="rent-row last-row">
        <text class="row-label other-label">联系电话</text>
        <input v-model="form.phone" class="row-input" type="number" placeholder="请填写" />
      </view>
    </view>

    <view class="rent-bottom">
      <view class="rent-agreement tap" @tap="toggleAgreement">
        <view class="rent-check" :class="{ active: agreementAccepted }">✓</view>
        <text>我承诺房源真实并同意</text>
        <text class="agreement-link">《个人用户租房房源展示服务协议》</text>
      </view>
      <view class="rent-submit tap" :class="{ disabled: submitting }" @tap="submit">
        {{ submitting ? '发布中' : '立即免费发布' }}
      </view>
    </view>

    <view class="rent-picker-mask" :class="{ visible: pickerVisible }" @tap="closeRentPicker">
      <view class="rent-picker-sheet" @tap.stop>
        <view class="rent-picker-head">
          <view class="picker-cancel tap" @tap="closeRentPicker">取消</view>
          <text>{{ activePickerTitle }}</text>
          <view class="picker-done tap" @tap="closeRentPicker">确定</view>
        </view>
        <picker-view v-if="activePickerKey === 'layout'" class="rent-wheel" :value="layoutPickerValue" indicator-style="height: 72rpx;" @change="onLayoutChange">
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
        <picker-view v-else-if="activePickerKey === 'floor'" class="rent-wheel" :value="floorPickerValue" indicator-style="height: 72rpx;" @change="onFloorChange">
          <picker-view-column>
            <view v-for="item in floorOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="item in totalFloorOptions" :key="item" class="wheel-item">{{ item }}</view>
          </picker-view-column>
        </picker-view>
        <scroll-view v-else scroll-y class="choice-scroll">
          <view class="choice-grid">
            <view
              v-for="item in activeChoiceOptions"
              :key="item"
              class="choice-item tap"
              :class="{ active: activeChoiceValue === item }"
              @tap="selectChoice(item)"
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

function createEmptyForm() {
  return {
    rentMode: '整套出租',
    city: '漯河',
    community: '',
    area: '',
    layout: '',
    orientation: '',
    moveInTime: '',
    rent: '',
    paymentMethod: '',
    images: [],
    tags: [],
    description: '',
    buildingNo: '',
    currentFloor: '',
    totalFloor: '',
    viewingTime: '随时看房',
    feeIncluded: '',
    ownerType: '个人房东',
    contact: '',
    phone: ''
  }
}

export default {
  components: { AppIcon },
  data() {
    return {
      form: createEmptyForm(),
      uploading: false,
      submitting: false,
      agreementAccepted: true,
      pickerVisible: false,
      activePickerKey: '',
      layoutPickerValue: [0, 1, 1],
      floorPickerValue: [0, 0],
      roomOptions: createRange('', 1, 8, '室'),
      hallOptions: createRange('', 0, 5, '厅'),
      bathOptions: createRange('', 0, 5, '卫'),
      floorOptions: createRange('', 1, 60, ''),
      totalFloorOptions: createRange('', 1, 60, ''),
      choiceOptions: {
        orientation: ['东', '南', '西', '北', '南北', '东西', '东南', '西南', '东北', '西北'],
        moveInTime: ['随时入住', '一周内', '半月内', '一个月内', '两个月内', '面议'],
        paymentMethod: ['押一付一', '押一付三', '押二付一', '押二付三', '半年付', '年付', '面议'],
        viewingTime: ['随时看房', '工作日看房', '周末看房', '晚上看房', '提前预约'],
        feeIncluded: ['物业费', '宽带费', '水费', '电费', '燃气费', '取暖费', '停车费', '面议'],
        ownerType: ['个人房东', '经纪人', '二房东']
      }
    }
  },
  computed: {
    imageText() {
      return this.uploading ? '上传中' : '添加室内图，出租更快~'
    },
    descriptionCount() {
      return (this.form.description || '').length
    },
    activePickerTitle() {
      const titles = {
        layout: '房屋户型',
        floor: '楼层',
        orientation: '房屋朝向',
        moveInTime: '入住时间',
        paymentMethod: '付款方式',
        viewingTime: '看房时间',
        feeIncluded: '费用包含',
        ownerType: '房东身份'
      }
      return titles[this.activePickerKey] || '请选择'
    },
    activeChoiceOptions() {
      return this.choiceOptions[this.activePickerKey] || []
    },
    activeChoiceValue() {
      return this.form[this.activePickerKey] || ''
    },
    floorText() {
      if (!this.form.currentFloor || !this.form.totalFloor) return ''
      return `${this.form.currentFloor}层 / 总${this.form.totalFloor}层`
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
    openRentPicker(key) {
      this.activePickerKey = key
      if (key === 'layout') this.syncLayoutPicker()
      if (key === 'floor') this.syncFloorPicker()
      this.pickerVisible = true
    },
    closeRentPicker() {
      this.pickerVisible = false
    },
    syncLayoutPicker() {
      const match = /^(\d+室)(\d+厅)(\d+卫)$/.exec(this.form.layout || '')
      if (!match) {
        this.layoutPickerValue = [0, 1, 1]
        this.form.layout = '1室1厅1卫'
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
      this.floorPickerValue = [currentIndex > -1 ? currentIndex : 0, totalIndex > -1 ? totalIndex : 0]
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
    selectChoice(value) {
      this.form[this.activePickerKey] = value
    },
    chooseImages() {
      const count = 4 - this.form.images.length
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
              if (data && data.url && this.form.images.length < 4) this.form.images.push(data.url)
            }
          } catch (error) {
            uni.showToast({ title: (error && error.message) || '图片上传失败', icon: 'none' })
          } finally {
            this.uploading = false
          }
        }
      })
    },
    removeImage(index) {
      this.form.images.splice(index, 1)
    },
    toggleDefaultTag() {
      const tag = '拎包入住'
      const index = this.form.tags.indexOf(tag)
      if (index > -1) this.form.tags.splice(index, 1)
      else this.form.tags.push(tag)
    },
    toggleAgreement() {
      this.agreementAccepted = !this.agreementAccepted
    },
    buildSummary() {
      const lines = [
        `出租方式：${this.form.rentMode}`,
        `城市：${this.form.city}`,
        `小区：${this.form.community || '未填写'}`,
        `面积：${this.form.area || '未填写'}m²`,
        `户型：${this.form.layout || '未选择'}`,
        `朝向：${this.form.orientation || '未选择'}`,
        `入住时间：${this.form.moveInTime || '未选择'}`,
        `付款方式：${this.form.paymentMethod || '未选择'}`,
        `楼层：${this.floorText || '未选择'}`,
        `看房时间：${this.form.viewingTime}`,
        `费用包含：${this.form.feeIncluded || '未选择'}`,
        `房东身份：${this.form.ownerType}`
      ]
      if (this.form.tags.length) lines.push(`房源标签：${this.form.tags.join('、')}`)
      if (this.form.description) lines.push(`房源描述：${this.form.description}`)
      return lines.join('\n')
    },
    resetForm() {
      this.form = createEmptyForm()
      this.agreementAccepted = true
    },
    async submit() {
      if (this.submitting) return
      if (!this.form.community || !this.form.area || !this.form.layout || !this.form.orientation || !this.form.moveInTime || !this.form.rent || !this.form.paymentMethod || !this.form.contact || !this.form.phone) {
        uni.showToast({ title: '请完善必填信息和联系方式', icon: 'none' })
        return
      }
      if (!this.agreementAccepted) {
        uni.showToast({ title: '请先阅读并同意协议', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const title = `${this.form.community} ${this.form.rentMode}`
        const highlights = [
          this.form.rentMode,
          `${this.form.area}m²`,
          this.form.layout,
          this.form.orientation,
          this.form.paymentMethod,
          this.form.ownerType
        ].filter((item) => item).map((item) => item.slice(0, 20)).slice(0, 6)
        const payload = {
          type: 'houses',
          title,
          tag: this.form.rentMode,
          price: `${this.form.rent}元/月`,
          address: `${this.form.city} ${this.form.community}`,
          contact: this.form.contact,
          phone: this.form.phone,
          summary: this.buildSummary(),
          highlights,
          details: {
            rentMode: this.form.rentMode,
            city: this.form.city,
            community: this.form.community,
            area: `${this.form.area}m²`,
            layout: this.form.layout,
            orientation: this.form.orientation,
            moveInTime: this.form.moveInTime,
            paymentMethod: this.form.paymentMethod,
            floor: this.floorText,
            viewingTime: this.form.viewingTime,
            feeIncluded: this.form.feeIncluded,
            ownerType: this.form.ownerType,
            tags: this.form.tags,
            description: this.form.description
          },
          images: this.form.images
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
.rent-publish-page {
  overflow-x: hidden;
  min-height: 100vh;
  padding: calc(92rpx + env(safe-area-inset-top)) 18rpx 168rpx;
  background: #f6f6f6;
}

.rent-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(88rpx + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 24rpx 0;
  background: rgba(255, 255, 255, 0.96);
}

.rent-back {
  position: absolute;
  bottom: 12rpx;
  left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.rent-nav-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.rent-hero {
  position: relative;
  overflow: hidden;
  min-height: 190rpx;
  margin: 0 -18rpx;
  padding: 36rpx 24rpx;
  background: linear-gradient(115deg, #ffffff 0%, #effff9 100%);
}

.rent-hero-title {
  position: relative;
  z-index: 2;
  display: block;
  color: #1f2937;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.rent-buildings {
  position: absolute;
  right: 32rpx;
  bottom: 0;
  width: 180rpx;
  height: 150rpx;
  opacity: 0.42;
}

.rent-building {
  position: absolute;
  bottom: 0;
  border-radius: 8rpx 8rpx 0 0;
  background: #b9f4df;
}

.rent-building-a {
  right: 0;
  width: 78rpx;
  height: 140rpx;
}

.rent-building-b {
  right: 88rpx;
  width: 68rpx;
  height: 104rpx;
}

.rent-mode-card,
.rent-card {
  border-radius: 18rpx;
  background: #ffffff;
}

.rent-mode-card {
  display: flex;
  align-items: center;
  min-height: 98rpx;
  margin-top: -18rpx;
  padding: 0 24rpx;
}

.required-star {
  flex: 0 0 18rpx;
  color: #ff5b3d;
  font-size: 24rpx;
  font-weight: 800;
}

.mode-label {
  flex: 1;
  min-width: 0;
  color: #1f2937;
  font-size: 28rpx;
  font-weight: 800;
}

.mode-tabs {
  display: flex;
  gap: 18rpx;
}

.mode-tab {
  height: 58rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #f4f4f4;
  color: #1f2937;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 58rpx;
}

.mode-tab.active {
  background: #e4fbf3;
  color: #22c995;
}

.rent-card {
  margin-top: 18rpx;
  padding: 30rpx 24rpx 12rpx;
}

.card-title {
  display: block;
  color: #111827;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 44rpx;
}

.rent-row {
  display: flex;
  align-items: center;
  min-height: 92rpx;
  border-bottom: 2rpx solid #edf0f3;
}

.last-row {
  border-bottom: 0;
}

.row-label {
  flex: 0 0 150rpx;
  color: #2b3037;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.verify-label,
.other-label {
  flex-basis: 152rpx;
}

.row-value,
.row-input {
  flex: 1;
  min-width: 0;
  color: #1f2937;
  font-size: 27rpx;
  font-weight: 700;
}

.row-input {
  height: 84rpx;
  line-height: 84rpx;
}

.row-value.placeholder {
  color: #9aa0a6;
  font-weight: 600;
}

.rent-input {
  font-size: 22rpx;
}

.row-arrow {
  color: #a7adb5;
  font-size: 44rpx;
  font-weight: 700;
}

.row-unit,
.floor-unit {
  color: #1f2937;
  font-size: 27rpx;
  font-weight: 700;
}

.floor-row {
  gap: 8rpx;
  border-bottom: 0;
}

.total-floor-label {
  flex: 0 0 88rpx;
  text-align: right;
}

.section-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.boost-tip {
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 6rpx;
  background: #fff6ee;
  color: #ff4d21;
  font-size: 22rpx;
  line-height: 34rpx;
}

.display-block {
  margin-top: 28rpx;
}

.display-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.display-title {
  color: #1f2937;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 40rpx;
}

.display-link {
  color: #6b7280;
  font-size: 22rpx;
}

.display-desc {
  display: block;
  margin-top: 6rpx;
  color: #9aa0a6;
  font-size: 24rpx;
  line-height: 34rpx;
}

.rent-image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 18rpx;
}

.rent-image-add,
.rent-image-item {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 170rpx;
  border-radius: 12rpx;
  background: #f6f6f6;
  color: #111827;
  font-size: 24rpx;
  font-weight: 800;
}

.rent-image-item {
  width: 180rpx;
  height: 180rpx;
}

.rent-image {
  width: 100%;
  height: 100%;
}

.image-remove {
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

.tag-box {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 94rpx;
  margin-top: 18rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #f7f7f7;
  color: #111827;
  font-size: 24rpx;
  font-weight: 800;
}

.tag-box-copy {
  flex: 1;
  min-width: 0;
}

.tag-action {
  flex: 0 0 auto;
  height: 58rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #28d79d;
  color: #ffffff;
  font-size: 26rpx;
  line-height: 58rpx;
}

.desc-textarea {
  width: 100%;
  min-height: 260rpx;
  margin-top: 14rpx;
  color: #111827;
  font-size: 26rpx;
  line-height: 40rpx;
}

.desc-count {
  display: block;
  color: #c5c8ce;
  font-size: 24rpx;
  text-align: right;
}

.contact-card {
  margin-bottom: 18rpx;
}

.rent-bottom {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 70;
  padding: 18rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
}

.rent-agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6rpx;
  color: #4b5563;
  font-size: 22rpx;
  line-height: 32rpx;
}

.rent-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #d1d5db;
  color: #ffffff;
  font-size: 20rpx;
}

.rent-check.active {
  background: #95dfc5;
}

.agreement-link {
  color: #356b8b;
}

.rent-submit {
  height: 82rpx;
  margin-top: 16rpx;
  border-radius: 18rpx;
  background: #98e5c9;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 82rpx;
  text-align: center;
}

.rent-submit.disabled,
.rent-image-add.disabled {
  opacity: 0.58;
}

.rent-picker-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  align-items: flex-end;
  background: rgba(17, 24, 39, 0.62);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.rent-picker-mask.visible {
  opacity: 1;
  pointer-events: auto;
}

.rent-picker-sheet {
  width: 100%;
  min-height: 40vh;
  padding: 0 32rpx calc(42rpx + env(safe-area-inset-bottom));
  border-radius: 20rpx 20rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
  transform: translateY(100%);
  transition: transform 260ms ease-out;
}

.rent-picker-mask.visible .rent-picker-sheet {
  transform: translateY(0);
}

.rent-picker-head {
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
  color: #24c994;
}

.rent-wheel {
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

.choice-scroll {
  max-height: 620rpx;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx;
  padding-top: 34rpx;
}

.choice-item {
  height: 66rpx;
  border: 2rpx solid #d0d5dd;
  border-radius: 8rpx;
  color: #111827;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 66rpx;
  text-align: center;
}

.choice-item.active {
  border-color: #24c994;
  background: #ecfff7;
  color: #24c994;
}
</style>
