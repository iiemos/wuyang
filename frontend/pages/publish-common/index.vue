<template>
  <view class="app-page publish-common-page">
    <view class="publish-hero">
      <AppHeader title="发布信息" subtitle="提交后进入后台审核队列" back />
      <view class="publish-tip">
        <view class="tip-icon">
          <AppIcon name="lucide:square-plus" color="#FFFFFF" size="46rpx" />
        </view>
        <view class="tip-copy">
          <text class="tip-title">发布前先预览</text>
          <text class="tip-desc">标题、价格和联系方式会影响用户是否点击</text>
        </view>
      </view>
    </view>

    <view class="type-picker card tap" @tap="openTypePicker">
      <view class="type-picker-copy">
        <text class="type-picker-label">发布类型</text>
        <view class="type-picker-value">
          <AppIcon :name="currentCategory.icon" color="#34D19D" size="34rpx" />
          <text>{{ currentLabel }}</text>
        </view>
      </view>
      <AppIcon name="lucide:chevron-right" color="#A8A8A8" size="32rpx" />
    </view>

    <view class="picker-mask" :class="{ visible: typePickerVisible }" @tap="closeTypePicker">
      <view class="type-sheet" @tap.stop>
        <view class="type-sheet-head">
          <view class="type-sheet-placeholder"></view>
          <text>选择发布类型</text>
          <view class="type-sheet-close tap" @tap="closeTypePicker">确定</view>
        </view>
        <view
          v-for="item in publishCategories"
          :key="item.type"
          class="type-option tap"
          :class="{ active: form.type === item.type }"
          @tap="selectType(item.type)"
        >
          <view class="type-option-main">
            <AppIcon :name="item.icon" :color="form.type === item.type ? '#FFFFFF' : '#34D19D'" size="34rpx" />
            <text>{{ item.label }}</text>
          </view>
          <text v-if="form.type === item.type" class="type-check">已选</text>
        </view>
      </view>
    </view>

    <view class="form card">
      <view class="field">
        <text>细分分类</text>
        <view class="tag-picker">
          <view
            v-for="tag in currentTags"
            :key="tag"
            class="tag-option tap"
            :class="{ active: form.tag === tag }"
            @tap="selectTag(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>
      <label class="field">
        <text>标题</text>
        <input v-model="form.title" placeholder="例如：周末奶茶店店员" />
      </label>
      <label class="field">
        <text>价格/待遇</text>
        <input v-model="form.price" placeholder="例如：18元/小时、1200元/月" />
      </label>
      <label class="field">
        <text>位置</text>
        <input v-model="form.address" placeholder="填写街道、小区或商圈" />
      </label>
      <label class="field">
        <text>联系人</text>
        <input v-model="form.contact" placeholder="联系人称呼" />
      </label>
      <label class="field">
        <text>联系电话</text>
        <input v-model="form.phone" type="number" placeholder="用于详情展示和联系" />
      </label>
      <label class="field">
        <text>详细描述</text>
        <textarea v-model="form.summary" placeholder="补充职责、配套、交易方式等关键信息" />
      </label>
      <label v-for="field in detailFields" :key="field.key" class="field">
        <text>{{ field.label }}</text>
        <input v-model="form.extras[field.key]" :placeholder="field.placeholder" />
      </label>
      <view class="field">
        <text>图片</text>
        <view class="image-grid">
          <view v-for="(image, index) in form.images" :key="image" class="image-item">
            <image :src="image" mode="aspectFill" />
            <view class="remove-image tap" @tap="removeImage(index)">×</view>
          </view>
          <view v-if="form.images.length < 4" class="image-add tap" :class="{ disabled: uploading }" @tap="chooseImages">
            <AppIcon name="lucide:square-plus" color="#34D19D" size="42rpx" />
            <text>{{ imageCountText }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="preview card">
      <text class="preview-title">提交预览</text>
      <text class="preview-main">{{ form.title || '未填写标题' }}</text>
      <text class="preview-desc line-clamp-2">{{ form.summary || '填写描述后会在列表卡片中展示。' }}</text>
      <view class="preview-row">
        <text class="tag">{{ currentLabel }}</text>
        <text class="tag">{{ form.tag }}</text>
        <text>{{ form.price || '价格待定' }}</text>
      </view>
      <view v-if="form.images.length" class="preview-images">
        <image v-for="image in form.images" :key="image" :src="image" mode="aspectFill" />
      </view>
    </view>

    <view class="primary-btn submit tap" :class="{ disabled: submitting }" @tap="submit">
      {{ submitting ? '提交中' : '提交审核' }}
    </view>
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import { createListing, uploadImage } from '../../utils/api'
import { categoryMeta, serviceCategories } from '../../data/catalog'

const detailFieldMap = {
  convenience: [
    { key: 'targetTime', label: '需求时间', placeholder: '例如：今天下午、周末、长期有效' },
    { key: 'requirement', label: '补充要求', placeholder: '例如：可拼车、需当面确认、请先电话沟通' }
  ],
  yellowPages: [
    { key: 'serviceTime', label: '服务时间', placeholder: '例如：9:00-21:00、节假日可约' },
    { key: 'serviceNote', label: '服务说明', placeholder: '例如：上门服务、报价透明、售后保障' }
  ],
  secondhand: [
    { key: 'condition', label: '物品成色', placeholder: '例如：9成新、功能正常、配件齐全' },
    { key: 'tradeMode', label: '交易方式', placeholder: '例如：同城自提、当面验货、可小刀' }
  ]
}
const commonTypes = ['convenience', 'yellowPages', 'secondhand']

function normalizeType(type) {
  return commonTypes.indexOf(type) === -1 ? 'convenience' : type
}

function categoryTags(type) {
  const tabs = categoryMeta[normalizeType(type)] && categoryMeta[normalizeType(type)].tabs
  return (tabs || ['全部']).filter((tag) => tag !== '全部')
}

function createExtras(type) {
  return (detailFieldMap[normalizeType(type)] || []).reduce((result, field) => {
    result[field.key] = ''
    return result
  }, {})
}

function createEmptyForm(type = 'convenience') {
  const normalizedType = normalizeType(type)
  const tags = categoryTags(normalizedType)
  return {
    type: normalizedType,
    tag: tags[0] || '全部',
    title: '',
    price: '',
    address: '',
    contact: '',
    phone: '',
    summary: '',
    images: [],
    extras: createExtras(normalizedType)
  }
}

export default {
  components: { AppHeader, AppIcon },
  data() {
    return {
      form: createEmptyForm(),
      submitting: false,
      uploading: false,
      typePickerVisible: false,
      serviceCategories
    }
  },
  computed: {
    publishCategories() {
      return this.serviceCategories.filter((entry) => commonTypes.indexOf(entry.type) !== -1)
    },
    currentCategory() {
      return this.serviceCategories.find((item) => item.type === this.form.type) || {
        label: '本地信息',
        icon: 'lucide:map-pin'
      }
    },
    currentLabel() {
      return this.currentCategory.label
    },
    currentTags() {
      return categoryTags(this.form.type)
    },
    detailFields() {
      return detailFieldMap[this.form.type] || []
    },
    imageCountText() {
      return this.uploading ? '上传中' : `${this.form.images.length}/4`
    }
  },
  onLoad(query) {
    if (query && query.type === 'houses') {
      uni.redirectTo({ url: '/pages/publish-house/index' })
      return
    }
    if (query && query.type) this.form = createEmptyForm(query.type)
  },
  methods: {
    openTypePicker() {
      this.typePickerVisible = true
    },
    closeTypePicker() {
      this.typePickerVisible = false
    },
    selectType(type) {
      this.form = createEmptyForm(type)
    },
    selectTag(tag) {
      this.form.tag = tag
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
          try {
            for (const filePath of res.tempFilePaths) {
              const data = await uploadImage(filePath)
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
    resetForm(type = this.form.type) {
      this.form = createEmptyForm(type)
    },
    async submit() {
      if (this.submitting) return
      if (!this.form.title || !this.form.contact || !this.form.phone) {
        uni.showToast({ title: '请填写标题、联系人和电话', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const details = this.buildDetails()
        const payload = {
          type: this.form.type,
          tag: this.form.tag || '全部',
          title: this.form.title,
          price: this.form.price,
          address: this.form.address,
          contact: this.form.contact,
          phone: this.form.phone,
          summary: this.form.summary,
          images: this.form.images,
          details,
          highlights: this.buildHighlights(details)
        }
        const data = await createListing(payload)
        uni.setStorageSync('lastPublishRecord', data)
        this.savePreviewToken(data.id, data.previewToken)
        const targetType = data.type || this.form.type
        const targetUrl = `/pages/detail/index?type=${encodeURIComponent(targetType)}&id=${encodeURIComponent(data.id)}`
        this.resetForm(targetType)
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
    },
    buildDetails() {
      const details = { categoryLabel: this.currentLabel }
      this.detailFields.forEach((field) => {
        const value = this.form.extras && this.form.extras[field.key] ? String(this.form.extras[field.key]).trim() : ''
        if (value) details[field.key] = value
      })
      return details
    },
    buildHighlights(details) {
      const values = Object.keys(details)
        .filter((key) => key !== 'categoryLabel')
        .map((key) => details[key])
      return this.uniqueList(['新发布', this.currentLabel, this.form.tag].concat(values))
        .map((item) => item.slice(0, 20))
        .slice(0, 6)
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
.publish-common-page {
  overflow-x: hidden;
}

.publish-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 18rpx;
  border-radius: 0 0 44rpx 44rpx;
  background:
    radial-gradient(circle at 86% 10%, rgba(255, 255, 255, 0.72) 0, rgba(255, 255, 255, 0) 190rpx),
    linear-gradient(135deg, #dcffe2 0%, #f8ffcb 100%);
}

.publish-tip {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.78);
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 84rpx;
  width: 84rpx;
  height: 84rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #20d962 0%, #9af556 100%);
}

.tip-copy {
  flex: 1;
  min-width: 0;
}

.tip-title,
.tip-desc {
  display: block;
}

.tip-title {
  color: #1a1a1a;
  font-size: 32rpx;
  font-weight: 800;
}

.tip-desc {
  margin-top: 8rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 32rpx;
}

.type-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 24rpx;
  padding: 26rpx 28rpx;
}

.type-picker-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
}

.type-picker-label {
  flex-shrink: 0;
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 600;
}

.type-picker-value,
.type-option-main {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.type-picker-value {
  color: #333333;
  font-size: 30rpx;
  font-weight: 600;
}

.picker-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.42);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.picker-mask.visible {
  opacity: 1;
  pointer-events: auto;
}

.type-sheet {
  width: 100%;
  padding: 28rpx 28rpx calc(32rpx + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  background: #ffffff;
  transform: translateY(100%);
  transition: transform 260ms ease-out;
}

.picker-mask.visible .type-sheet {
  transform: translateY(0);
}

.type-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  color: #1a1a1a;
  font-size: 32rpx;
  font-weight: 700;
}

.type-sheet-placeholder,
.type-sheet-close {
  min-width: 80rpx;
}

.type-sheet-close {
  color: #999999;
  font-size: 26rpx;
  font-weight: 500;
  text-align: right;
}

.type-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  margin-top: 14rpx;
  padding: 0 24rpx;
  border-radius: 15rpx;
  background: #f7fff9;
  color: #333333;
  font-size: 30rpx;
}

.type-option.active {
  background: #222222;
  color: #ffffff;
  font-weight: 700;
}

.type-check {
  color: inherit;
  font-size: 24rpx;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
  margin-top: 24rpx;
  padding: 30rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field text {
  color: #1a1a1a;
  font-size: 28rpx;
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  border: 2rpx solid rgba(121, 248, 157, 0.26);
  border-radius: 28rpx;
  background: #f7fff9;
  color: #333333;
  font-size: 28rpx;
}

.field input {
  height: 88rpx;
  padding: 0 24rpx;
}

.field textarea {
  min-height: 180rpx;
  padding: 22rpx 24rpx;
  line-height: 40rpx;
}

.tag-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.tag-option {
  height: 58rpx;
  padding: 0 22rpx;
  border-radius: 15rpx;
  background: #f7fff9;
  color: #596273;
  font-size: 24rpx;
  line-height: 58rpx;
}

.tag-option.active {
  background: #222222;
  color: #ffffff;
  font-weight: 700;
}

.image-grid,
.preview-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item,
.image-add,
.preview-images image {
  width: 142rpx;
  height: 142rpx;
  border-radius: 15rpx;
}

.image-item {
  position: relative;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 15rpx;
  background: rgba(0, 0, 0, 0.58);
  color: #ffffff;
  font-size: 28rpx;
  line-height: 40rpx;
  text-align: center;
}

.image-add {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8rpx;
  border: 2rpx dashed rgba(52, 209, 157, 0.46);
  background: #f7fff9;
  color: #34d19d;
  font-size: 24rpx;
}

.preview {
  margin-top: 24rpx;
  padding: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f2fff7 100%);
}

.preview-title {
  color: #34d19d;
  font-size: 26rpx;
  font-weight: 600;
}

.preview-main {
  display: block;
  margin-top: 12rpx;
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 44rpx;
}

.preview-desc {
  margin-top: 10rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 36rpx;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 20rpx;
  color: #ff9f29;
  font-size: 30rpx;
  font-weight: 700;
}

.preview-images {
  margin-top: 18rpx;
}

.submit {
  margin-top: 28rpx;
}
</style>
