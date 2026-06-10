<template>
  <view class="app-page job-publish-page">
    <view class="job-nav">
      <view class="job-back tap" @tap="goBack">
        <AppIcon name="lucide:chevron-left" color="#10233F" size="42rpx" />
      </view>
      <text class="job-nav-title">发布招聘</text>
    </view>

    <view class="job-shell">
      <view class="job-ai-head">
        <text class="job-ai-title">已为您智能生成职位，可直接发布</text>
        <view class="job-ai-tags">
          <text>舞阳本地 · 招聘职位</text>
          <text>吸引力超越周边</text>
          <text class="job-ai-percent">99.5%</text>
          <text>同行</text>
        </view>
      </view>

      <view class="job-form-panel">
        <view class="job-field">
          <view class="job-label-row">
            <text class="job-label required">职位标题</text>
            <view class="job-inline-action tap" @tap="swapJobTitle">
              <text>↔</text>
              <text>换一个</text>
            </view>
          </view>
          <input v-model="form.title" class="job-input" placeholder="急招服务员" />
        </view>

        <view class="job-field">
          <view class="job-salary-tabs">
            <view
              v-for="item in salaryModes"
              :key="item.value"
              class="job-salary-tab tap"
              :class="{ active: jobSalaryMode === item.value }"
              @tap="setSalaryMode(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
          <view class="job-salary-box">
            <view v-if="jobSalaryMode === 'fixed'" class="job-salary-inputs">
              <input v-model="jobSalaryFixed" class="job-salary-input" type="number" placeholder="20" />
            </view>
            <view v-else class="job-salary-inputs">
              <input v-model="jobSalaryMin" class="job-salary-input" type="number" placeholder="15" />
              <text class="job-salary-between">至</text>
              <input v-model="jobSalaryMax" class="job-salary-input" type="number" placeholder="25" />
            </view>
            <view class="job-unit tap" @tap="openUnitPicker">
              <text>{{ jobSalaryUnit }}</text>
              <text>▾</text>
            </view>
          </view>
          <view class="job-settle-row">
            <view
              v-for="item in settlementOptions"
              :key="item"
              class="job-settle tap"
              :class="{ active: jobSettlement === item }"
              @tap="setSettlement(item)"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <view class="job-field">
          <view class="job-label-row">
            <text class="job-label required">职位描述</text>
            <view class="job-label-actions">
              <view class="job-inline-action tap" @tap="swapJobSummary">
                <text>↔</text>
                <text>换一个</text>
              </view>
              <view class="job-inline-action tap" @tap="clearJobSummary">
                <text>▣</text>
                <text>清空</text>
              </view>
            </view>
          </view>
          <textarea v-model="form.summary" class="job-textarea" placeholder="填写岗位职责、任职要求和工作安排" />
        </view>

        <view class="job-mini-row tap" @tap="showContactTip">
          <text class="job-mini-muted">求职者可通过微信号联系我</text>
          <text class="job-mini-link">去填写</text>
          <text>›</text>
        </view>

        <view class="job-mini-row">
          <text class="job-mini-muted">招聘人数</text>
          <input v-model="jobRecruitCount" class="job-count-input" type="number" />
          <text>人</text>
        </view>

        <view class="job-require-head">
          <text>继续完善要求</text>
          <text class="job-progress">+30%求职者精准度</text>
          <view class="job-collapse tap" @tap="toggleRequirements">
            <text>{{ requirementsCollapsed ? '⌄' : '⌃' }}</text>
            <text>{{ requirementsCollapsed ? '展开' : '收起' }}</text>
          </view>
        </view>
        <view v-if="!requirementsCollapsed" class="job-require-list">
          <view
            v-for="item in jobRequirements"
            :key="item.key"
            class="job-require-item tap"
            @tap="openRequirementPicker(item)"
          >
            <text class="job-require-label">{{ item.label }}</text>
            <text class="job-require-value">{{ item.value }}</text>
            <text>›</text>
          </view>
        </view>
      </view>
    </view>

    <view class="job-submit-wrap">
      <view class="job-submit tap" :class="{ disabled: submitting }" @tap="submit">
        {{ submitting ? '发布中' : '确认发布' }}
      </view>
    </view>

    <view class="unit-mask" :class="{ visible: unitPickerVisible }" @tap="closeUnitPicker">
      <view class="unit-sheet" @tap.stop>
        <view class="unit-sheet-head">
          <text>薪资单位</text>
          <view class="unit-close tap" @tap="closeUnitPicker">×</view>
        </view>
        <view class="unit-options">
          <view
            v-for="item in salaryUnits"
            :key="item"
            class="unit-option tap"
            :class="{ active: jobSalaryUnit === item }"
            @tap="selectSalaryUnit(item)"
          >
            {{ item }}
          </view>
        </view>
        <view class="unit-confirm tap" @tap="closeUnitPicker">确定</view>
      </view>
    </view>

    <view class="require-mask" :class="{ visible: requirePickerVisible }" @tap="closeRequirementPicker">
      <view class="require-sheet" @tap.stop>
        <view class="require-sheet-head">
          <view class="require-cancel tap" @tap="closeRequirementPicker">取消</view>
          <text>{{ activeRequirementTitle }}</text>
          <view class="require-done tap" @tap="closeRequirementPicker">确定</view>
        </view>
        <view v-if="activeRequirementMode === 'picker'" class="require-picker-wrap">
          <picker-view
            class="require-picker"
            :value="pickerViewValue"
            indicator-class="require-picker-indicator"
            indicator-style="height: 64rpx;"
            @change="onRequirementPickerChange"
          >
            <picker-view-column>
              <view v-for="item in activeRequirementOptions" :key="item" class="require-picker-item">{{ item }}</view>
            </picker-view-column>
          </picker-view>
        </view>
        <scroll-view v-else-if="activeRequirementKey === 'workTime'" scroll-y class="require-scroll">
          <view class="require-section">
            <text class="require-section-title">兼职类别</text>
            <view class="require-chip-row">
              <view
                v-for="item in requirementOptions.partTimeType"
                :key="item"
                class="require-chip tap"
                :class="{ active: jobRequirementValues.partTimeType === item }"
                @tap="selectPartTimeType(item)"
              >
                {{ item }}
              </view>
            </view>
          </view>
          <view class="require-section">
            <text class="require-section-title">工作日期</text>
            <view class="require-chip-row">
              <view
                v-for="item in requirementOptions.workDays"
                :key="item"
                class="require-chip tap"
                :class="{ active: isWorkMultiSelected('workDays', item) }"
                @tap="toggleWorkMulti('workDays', item)"
              >
                {{ item }}
              </view>
            </view>
          </view>
          <view class="require-section">
            <text class="require-section-title">工作时段</text>
            <view class="require-chip-row">
              <view
                v-for="item in requirementOptions.workPeriods"
                :key="item"
                class="require-chip tap"
                :class="{ active: isWorkMultiSelected('workPeriods', item) }"
                @tap="toggleWorkMulti('workPeriods', item)"
              >
                {{ item }}
              </view>
            </view>
          </view>
        </scroll-view>
        <scroll-view v-else scroll-y class="require-scroll">
          <view class="require-chip-row require-chip-row-large">
            <view
              v-for="item in activeRequirementOptions"
              :key="item"
              class="require-chip tap"
              :class="{ active: isRequirementOptionSelected(item) }"
              @tap="toggleMultiRequirement(item)"
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
import { createListing } from '../../utils/api'

function defaultJobSummary() {
  return [
    '岗位职责：',
    '1、提供高质量的服务，确保顾客满意度。',
    '2、协助门店完成日常经营工作。',
    '3、保持工作区域环境整洁。'
  ].join('\n')
}

function createEmptyForm() {
  return {
    type: 'jobs',
    title: '急招服务员',
    price: '',
    address: '舞阳县 本地岗位',
    contact: '招聘方',
    phone: '000000',
    summary: defaultJobSummary()
  }
}

function createDefaultJobRequirementValues() {
  return {
    age: '18岁-不限',
    gender: '不限',
    education: '不限',
    partTimeType: '长期兼职',
    workDays: ['3~4天'],
    workPeriods: ['早班', '晚班'],
    welfare: [],
    other: ['身高', '健康证']
  }
}

function createRequirementOptions() {
  return {
    age: ['不限', '18岁-不限', '18-25岁', '18-35岁', '20-45岁', '45岁以下'],
    gender: ['不限', '男', '女'],
    education: ['不限', '初中及以上', '高中及以上', '大专及以上', '本科及以上'],
    partTimeType: ['长期兼职', '短期兼职', '周末兼职', '假期兼职', '临时工', '实习兼职'],
    workDays: ['时间不限', '周一至周五', '周末', '1~2天', '3~4天', '5天以上'],
    workPeriods: ['时间不限', '早班', '中班', '晚班', '全天', '凌晨班'],
    welfare: ['无福利', '包吃', '包住', '交通补贴', '餐补', '高温补贴', '有提成', '奖金'],
    other: ['无特殊要求', '身高', '健康证', '有经验优先', '能吃苦耐劳', '可接受新手']
  }
}

function joinSelected(items, fallback) {
  return Array.isArray(items) && items.length ? items.join('、') : fallback
}

function uniqueItems(items) {
  const result = []
  items.forEach((item) => {
    if (result.indexOf(item) === -1) result.push(item)
  })
  return result
}

function formatWorkRequirement(values) {
  const days = Array.isArray(values.workDays) ? values.workDays : []
  const periods = Array.isArray(values.workPeriods) ? values.workPeriods : []
  return joinSelected(uniqueItems(days.concat(periods)), '时间不限')
}

export default {
  components: { AppIcon },
  data() {
    return {
      form: createEmptyForm(),
      submitting: false,
      unitPickerVisible: false,
      requirePickerVisible: false,
      requirementsCollapsed: false,
      activeRequirementKey: '',
      pickerViewValue: [0],
      jobSalaryMode: 'fixed',
      jobSalaryFixed: '20',
      jobSalaryMin: '15',
      jobSalaryMax: '25',
      jobSalaryUnit: '元/小时',
      jobSettlement: '完工结',
      jobRecruitCount: '10',
      jobRequirementValues: createDefaultJobRequirementValues(),
      requirementOptions: createRequirementOptions(),
      salaryModes: [
        { label: '固定薪资', value: 'fixed' },
        { label: '范围薪资', value: 'range' }
      ],
      settlementOptions: ['日结', '月结', '周结', '完工结', '面议'],
      salaryUnits: ['元/小时', '元/天', '元/周', '元/月', '元/次', '元/其他']
    }
  },
  computed: {
    jobRequirements() {
      const values = this.jobRequirementValues
      return [
        { key: 'age', label: '年龄', value: values.age },
        { key: 'gender', label: '性别', value: values.gender },
        { key: 'education', label: '学历', value: values.education },
        { key: 'partTimeType', label: '兼职类别', value: values.partTimeType },
        { key: 'workTime', label: '工作时段', value: formatWorkRequirement(values) },
        { key: 'welfare', label: '福利与提成', value: joinSelected(values.welfare, '0项福利') },
        { key: 'other', label: '其他', value: joinSelected(values.other, '无特殊要求') }
      ]
    },
    jobPriceText() {
      if (this.jobSalaryMode === 'range') return `${this.jobSalaryMin || 15}-${this.jobSalaryMax || 25}${this.jobSalaryUnit}`
      return `${this.jobSalaryFixed || 20}${this.jobSalaryUnit}`
    },
    activeRequirementTitle() {
      const active = this.jobRequirements.find(item => item.key === this.activeRequirementKey)
      return active ? active.label : '选择要求'
    },
    activeRequirementOptions() {
      return this.requirementOptions[this.activeRequirementKey] || []
    },
    activeRequirementMode() {
      if (this.activeRequirementKey === 'workTime') return 'workTime'
      if (this.activeRequirementKey === 'welfare' || this.activeRequirementKey === 'other') return 'multi'
      return 'picker'
    }
  },
  methods: {
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/publish/index' })
    },
    setSalaryMode(mode) {
      this.jobSalaryMode = mode
    },
    setSettlement(value) {
      this.jobSettlement = value
    },
    openUnitPicker() {
      this.unitPickerVisible = true
    },
    closeUnitPicker() {
      this.unitPickerVisible = false
    },
    selectSalaryUnit(unit) {
      this.jobSalaryUnit = unit
    },
    toggleRequirements() {
      this.requirementsCollapsed = !this.requirementsCollapsed
    },
    openRequirementPicker(item) {
      this.activeRequirementKey = item.key
      if (this.activeRequirementMode === 'picker') {
        const options = this.requirementOptions[item.key] || []
        const index = options.indexOf(this.jobRequirementValues[item.key])
        this.pickerViewValue = [index > -1 ? index : 0]
      }
      this.requirePickerVisible = true
    },
    closeRequirementPicker() {
      this.requirePickerVisible = false
    },
    onRequirementPickerChange(event) {
      const value = event.detail && event.detail.value ? event.detail.value : [0]
      const index = value[0] || 0
      const option = this.activeRequirementOptions[index]
      this.pickerViewValue = [index]
      if (option) this.$set(this.jobRequirementValues, this.activeRequirementKey, option)
    },
    selectPartTimeType(option) {
      this.$set(this.jobRequirementValues, 'partTimeType', option)
    },
    isRequirementOptionSelected(option) {
      const selected = this.jobRequirementValues[this.activeRequirementKey]
      if (!Array.isArray(selected) || !selected.length) return option === '无福利' || option === '无特殊要求'
      return selected.indexOf(option) > -1
    },
    toggleMultiRequirement(option) {
      const key = this.activeRequirementKey
      if (option === '无福利' || option === '无特殊要求') {
        this.$set(this.jobRequirementValues, key, [])
        return
      }
      const current = Array.isArray(this.jobRequirementValues[key]) ? this.jobRequirementValues[key].slice() : []
      const index = current.indexOf(option)
      if (index > -1) current.splice(index, 1)
      else current.push(option)
      this.$set(this.jobRequirementValues, key, current)
    },
    isWorkMultiSelected(key, option) {
      const selected = this.jobRequirementValues[key]
      return Array.isArray(selected) && selected.indexOf(option) > -1
    },
    toggleWorkMulti(key, option) {
      if (option === '时间不限') {
        this.$set(this.jobRequirementValues, key, ['时间不限'])
        return
      }
      const current = Array.isArray(this.jobRequirementValues[key]) ? this.jobRequirementValues[key].filter(item => item !== '时间不限') : []
      const index = current.indexOf(option)
      if (index > -1) current.splice(index, 1)
      else current.push(option)
      this.$set(this.jobRequirementValues, key, current.length ? current : ['时间不限'])
    },
    swapJobTitle() {
      const titles = ['急招服务员', '餐饮店员', '后厨帮工', '收银服务员']
      const currentIndex = titles.indexOf(this.form.title)
      this.form.title = titles[(currentIndex + 1 + titles.length) % titles.length]
    },
    swapJobSummary() {
      this.form.summary = this.defaultSummary()
    },
    clearJobSummary() {
      this.form.summary = ''
    },
    showContactTip() {
      uni.showToast({ title: '提交后可在后台补充微信联系方式', icon: 'none' })
    },
    defaultSummary() {
      return defaultJobSummary()
    },
    resetForm() {
      this.form = createEmptyForm()
      this.jobSalaryMode = 'fixed'
      this.jobSalaryFixed = '20'
      this.jobSalaryMin = '15'
      this.jobSalaryMax = '25'
      this.jobSalaryUnit = '元/小时'
      this.jobSettlement = '完工结'
      this.jobRecruitCount = '10'
      this.jobRequirementValues = createDefaultJobRequirementValues()
      this.requirementsCollapsed = false
      this.requirePickerVisible = false
      this.activeRequirementKey = ''
      this.pickerViewValue = [0]
    },
    buildPayload() {
      const summary = this.form.summary || this.defaultSummary()
      const workDate = joinSelected(this.jobRequirementValues.workDays, '时间不限')
      const workTime = formatWorkRequirement(this.jobRequirementValues)
      const requirement = [
        this.jobRequirementValues.age,
        this.jobRequirementValues.gender,
        this.jobRequirementValues.education,
        joinSelected(this.jobRequirementValues.other, '')
      ].filter(item => item && item !== '不限').join('，')
      const highlights = [
        `招聘${this.jobRecruitCount || 1}人`,
        this.jobRequirementValues.age,
        this.jobRequirementValues.gender,
        this.jobRequirementValues.education,
        this.jobRequirementValues.partTimeType,
        formatWorkRequirement(this.jobRequirementValues),
        joinSelected(this.jobRequirementValues.welfare, ''),
        joinSelected(this.jobRequirementValues.other, '')
      ].filter(item => item && item !== '不限' && item !== '时间不限')
      return {
        ...this.form,
        price: this.jobPriceText,
        tag: this.jobSettlement,
        summary,
        highlights: highlights.map(item => item.slice(0, 20)).slice(0, 6),
        details: {
          recruitCount: Number(this.jobRecruitCount || 1),
          settlement: this.jobSettlement,
          salaryMode: this.jobSalaryMode,
          salaryUnit: this.jobSalaryUnit,
          workDate,
          workTime,
          requirement,
          partTimeType: this.jobRequirementValues.partTimeType,
          welfare: this.jobRequirementValues.welfare
        },
        images: []
      }
    },
    async submit() {
      if (this.submitting) return
      if (!this.form.title) {
        uni.showToast({ title: '请填写职位标题', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const data = await createListing(this.buildPayload())
        uni.setStorageSync('lastPublishRecord', data)
        this.savePreviewToken(data.id, data.previewToken)
        const targetUrl = `/pages/detail/index?type=jobs&id=${encodeURIComponent(data.id)}`
        this.resetForm()
        uni.showToast({ title: '已提交审核', icon: 'none' })
        setTimeout(() => {
          uni.redirectTo({ url: targetUrl })
        }, 400)
      } catch {
        uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
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
.job-publish-page {
  overflow-x: hidden;
  padding: 0 0 160rpx;
  background: linear-gradient(180deg, #ebfff3 0%, #f7fff9 360rpx, #f6f7fb 100%);
}

.job-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(88rpx + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 28rpx 0;
  background: rgba(235, 255, 243, 0.96);
}

.job-back {
  position: absolute;
  bottom: 12rpx;
  left: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.job-nav-title {
  color: #10233f;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.job-shell {
  min-height: 100vh;
  padding: calc(116rpx + env(safe-area-inset-top)) 24rpx 20rpx;
}

.job-ai-head {
  padding: 22rpx 22rpx 26rpx;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.78) 0, rgba(255, 255, 255, 0) 160rpx),
    linear-gradient(135deg, #d9fff0 0%, #f7ffe6 100%);
}

.job-ai-title {
  display: block;
  color: #10233f;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 46rpx;
}

.job-ai-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
  color: #7c8798;
  font-size: 22rpx;
  line-height: 32rpx;
}

.job-ai-percent {
  color: #00aeb4;
  font-weight: 800;
}

.job-form-panel {
  margin-top: 22rpx;
  padding: 26rpx 22rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 36rpx rgba(35, 74, 61, 0.08);
}

.job-field {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f3f5;
}

.job-field:first-child {
  padding-top: 0;
}

.job-label-row,
.job-label-actions,
.job-inline-action {
  display: flex;
  align-items: center;
}

.job-label-row {
  justify-content: space-between;
  gap: 16rpx;
}

.job-label {
  color: #10233f;
  font-size: 28rpx;
  font-weight: 700;
}

.required:before {
  color: #ff4d4f;
  content: "*";
}

.job-label-actions {
  gap: 20rpx;
}

.job-inline-action {
  gap: 6rpx;
  color: #00aeb4;
  font-size: 24rpx;
}

.job-input {
  width: 100%;
  height: 82rpx;
  margin-top: 12rpx;
  color: #10233f;
  font-size: 30rpx;
  font-weight: 700;
}

.job-salary-tabs {
  display: flex;
  gap: 18rpx;
}

.job-salary-tab {
  height: 54rpx;
  padding: 0 24rpx;
  border-radius: 15rpx;
  background: #f2f5f7;
  color: #7a8496;
  font-size: 24rpx;
  line-height: 54rpx;
}

.job-salary-tab.active {
  background: #e3fbfa;
  color: #08b8bb;
}

.job-salary-box {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 20rpx;
}

.job-salary-inputs {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 86rpx;
  border-radius: 18rpx;
  background: #f7fafc;
}

.job-salary-input {
  flex: 1;
  min-width: 0;
  height: 86rpx;
  padding: 0 22rpx;
  color: #10233f;
  font-size: 36rpx;
  font-weight: 800;
}

.job-salary-between {
  color: #a0a7b3;
  font-size: 24rpx;
}

.job-unit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-width: 160rpx;
  height: 86rpx;
  border-radius: 18rpx;
  background: #f7fafc;
  color: #10233f;
  font-size: 26rpx;
}

.job-settle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 18rpx;
}

.job-settle {
  min-width: 104rpx;
  height: 54rpx;
  padding: 0 18rpx;
  border-radius: 15rpx;
  background: #f2f5f7;
  color: #7a8496;
  font-size: 24rpx;
  line-height: 54rpx;
  text-align: center;
}

.job-settle.active {
  background: #10233f;
  color: #ffffff;
}

.job-textarea {
  width: 100%;
  min-height: 280rpx;
  margin-top: 16rpx;
  padding: 22rpx;
  border-radius: 22rpx;
  background: #f7fafc;
  color: #334155;
  font-size: 26rpx;
  line-height: 40rpx;
}

.job-mini-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-height: 88rpx;
  border-bottom: 2rpx solid #f0f3f5;
  color: #10233f;
  font-size: 26rpx;
}

.job-mini-muted {
  flex: 1;
  min-width: 0;
  color: #667085;
}

.job-mini-link {
  color: #08b8bb;
}

.job-count-input {
  width: 88rpx;
  height: 60rpx;
  border-radius: 15rpx;
  background: #f7fafc;
  color: #10233f;
  font-size: 28rpx;
  text-align: center;
}

.job-require-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 22rpx;
  color: #10233f;
  font-size: 28rpx;
  font-weight: 700;
}

.job-progress {
  flex: 1;
  min-width: 0;
  color: #08b8bb;
  font-size: 22rpx;
  font-weight: 500;
}

.job-collapse {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: #8b94a5;
  font-size: 22rpx;
  font-weight: 500;
}

.job-require-list {
  margin-top: 8rpx;
}

.job-require-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 78rpx;
  border-bottom: 2rpx solid #f5f7f9;
  color: #a0a7b3;
  font-size: 24rpx;
}

.job-require-label {
  width: 150rpx;
  color: #667085;
}

.job-require-value {
  overflow: hidden;
  flex: 1;
  min-width: 0;
  color: #10233f;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-submit-wrap {
  position: fixed;
  right: 24rpx;
  bottom: calc(22rpx + env(safe-area-inset-bottom));
  left: 24rpx;
  z-index: 60;
}

.job-submit {
  height: 94rpx;
  border-radius: 15rpx;
  background: #14bfc4;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 94rpx;
  text-align: center;
  box-shadow: 0 14rpx 28rpx rgba(20, 191, 196, 0.24);
}

.unit-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.42);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.unit-mask.visible {
  opacity: 1;
  pointer-events: auto;
}

.unit-sheet {
  width: 100%;
  padding: 28rpx 28rpx calc(32rpx + env(safe-area-inset-bottom));
  border-radius: 34rpx 34rpx 0 0;
  background: #ffffff;
  transform: translateY(100%);
  transition: transform 260ms ease-out;
}

.unit-mask.visible .unit-sheet {
  transform: translateY(0);
}

.unit-sheet-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  color: #10233f;
  font-size: 30rpx;
  font-weight: 700;
}

.unit-close {
  position: absolute;
  right: 0;
  top: 0;
  width: 64rpx;
  height: 64rpx;
  color: #98a2b3;
  font-size: 38rpx;
  line-height: 64rpx;
  text-align: center;
}

.unit-options {
  margin-top: 14rpx;
}

.unit-option {
  height: 82rpx;
  border-bottom: 2rpx solid #f1f3f5;
  color: #10233f;
  font-size: 28rpx;
  line-height: 82rpx;
  text-align: center;
}

.unit-option.active {
  color: #08b8bb;
  font-weight: 700;
}

.unit-confirm {
  height: 90rpx;
  margin-top: 22rpx;
  border-radius: 15rpx;
  background: #14bfc4;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 90rpx;
  text-align: center;
}

.require-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.42);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}

.require-mask.visible {
  opacity: 1;
  pointer-events: auto;
}

.require-sheet {
  width: 100%;
  min-height: 40vh;
  padding: 26rpx 28rpx calc(34rpx + env(safe-area-inset-bottom));
  border-radius: 34rpx 34rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
  transform: translateY(100%);
  transition: transform 260ms ease-out;
}

.require-mask.visible .require-sheet {
  transform: translateY(0);
}

.require-sheet-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 68rpx;
  color: #10233f;
  font-size: 30rpx;
  font-weight: 700;
}

.require-cancel,
.require-done {
  position: absolute;
  top: 0;
  height: 68rpx;
  color: #667085;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 68rpx;
}

.require-cancel {
  left: 0;
}

.require-done {
  right: 0;
  color: #1fc56f;
}

.require-picker-wrap {
  position: relative;
  margin-top: 14rpx;
  padding: 10rpx 0 4rpx;
}

.require-picker {
  width: 100%;
  height: 420rpx;
}

.require-picker-indicator {
  height: 64rpx;
  border-top: 2rpx solid #edf7f0;
  border-bottom: 2rpx solid #edf7f0;
  border-radius: 14rpx;
  background: rgba(31, 197, 111, 0.06);
}

.require-picker-item {
  height: 72rpx;
  color: #10233f;
  font-size: 28rpx;
  line-height: 72rpx;
  text-align: center;
}

.require-scroll {
  max-height: 620rpx;
  margin-top: 12rpx;
}

.require-section {
  padding: 12rpx 0 18rpx;
}

.require-section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #667085;
  font-size: 24rpx;
  line-height: 34rpx;
}

.require-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.require-chip-row-large {
  padding-top: 16rpx;
}

.require-chip {
  min-width: 142rpx;
  height: 62rpx;
  padding: 0 22rpx;
  border: 2rpx solid transparent;
  border-radius: 15rpx;
  background: #f5f7fa;
  color: #475467;
  font-size: 24rpx;
  line-height: 62rpx;
  text-align: center;
}

.require-chip.active {
  border-color: #1fc56f;
  background: #ecfff4;
  color: #1fc56f;
}
</style>
