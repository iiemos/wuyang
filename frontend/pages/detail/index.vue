<template>
  <view class="app-page detail-page" :class="{ 'job-detail-page': isJobDetail || isCommonDetail, 'house-detail-page': isHouseDetail, 'common-detail-page': isCommonDetail }">
    <view v-if="item && isJobDetail" class="job-detail">
      <view class="job-nav">
        <view class="job-nav-btn tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#121826" size="42rpx" />
        </view>
        <text class="job-nav-title">职位详情</text>
      </view>

      <view class="job-card job-summary-card">
        <view class="job-safe-row">
          <view class="job-safe-main">
            <view class="job-safe-icon">
              <AppIcon name="lucide:hand-heart" color="#FFFFFF" size="24rpx" />
            </view>
            <text class="job-safe-title">求职保障</text>
            <text class="job-safe-desc">已参加求职保障计划 安心赚钱</text>
          </view>
          <AppIcon name="lucide:chevron-right" color="#BBC2CE" size="28rpx" />
        </view>
        <text class="job-title">{{ item.title }}</text>
        <text class="job-salary">{{ jobSalary }}</text>
        <view class="job-tags">
          <text v-for="tag in jobTags" :key="tag" class="job-tag">{{ tag }}</text>
        </view>
        <view class="job-applicants">
          <view class="job-avatar-stack">
            <view v-for="avatar in jobAvatars" :key="avatar" class="job-mini-avatar">{{ avatar }}</view>
          </view>
          <text>{{ jobApplicantText }}</text>
        </view>
      </view>

      <view class="job-card job-info-card">
        <view v-for="row in jobInfoRows" :key="row.label" class="job-info-row">
          <view class="job-info-icon">
            <AppIcon :name="row.icon" :color="row.color" size="28rpx" />
          </view>
          <view class="job-info-main">
            <text class="job-info-label">{{ row.label }}</text>
            <text class="job-info-value">{{ row.value }}</text>
            <text v-if="row.extra" class="job-info-extra">{{ row.extra }}</text>
          </view>
          <AppIcon v-if="row.arrow" name="lucide:chevron-right" color="#C6CBD6" size="30rpx" />
        </view>
      </view>

      <view class="job-section-title">职位详情</view>
      <view class="job-card job-description">
        <text v-for="line in jobDetailLines" :key="line" class="job-description-line">{{ line }}</text>
      </view>

      <view class="job-section-title">发布者</view>
      <view class="job-card job-publisher">
        <view class="job-publisher-main">
          <view class="job-avatar">
            <AppIcon name="lucide:user-round" color="#202A3A" size="42rpx" />
          </view>
          <view class="job-publisher-copy">
            <text class="job-publisher-name">{{ jobPublisherName }}</text>
            <view class="job-auth-row">
              <text class="job-auth-dot">✔</text>
              <text>个人认证</text>
            </view>
          </view>
        </view>
        <view class="job-publisher-line"></view>
        <view class="job-verify-row">
          <text class="job-verify-icon">◎</text>
          <text>已通过实名验证</text>
        </view>
      </view>

      <view class="job-card job-tip-card">
        <view class="job-tip-head">
          <view class="job-tip-icon">
            <AppIcon name="lucide:job-tie" color="#FFFFFF" size="28rpx" />
          </view>
          <text>小贴士</text>
        </view>
        <text class="job-tip-text">求职过程中严禁索要押金、扣款、扣身份证、让缴费等行为，遇到异常请及时举报。</text>
      </view>

      <view v-if="relatedJobs.length" class="related-section">
        <view class="related-tabs">
          <view class="related-tab active">相关推荐</view>
        </view>
        <view class="related-list">
          <view v-for="job in relatedJobs" :key="job.id" class="related-card tap" @tap="openRelatedJob(job)">
            <view class="related-head">
              <text class="related-title">{{ job.title }}</text>
              <text class="related-salary">{{ job.price }}</text>
            </view>
            <view class="related-tags">
              <text v-for="tag in relatedJobTags(job)" :key="tag" class="related-tag">{{ tag }}</text>
            </view>
            <view class="related-bottom">
              <view class="related-logo">{{ relatedCompanyInitial(job) }}</view>
              <view class="related-main">
                <view class="related-company-line">
                  <text class="related-company">{{ relatedCompanyName(job) }}</text>
                  <text class="related-verify">✓ 企业验真</text>
                </view>
                <text class="related-address">{{ relatedAddress(job) }}</text>
              </view>
              <view class="related-apply tap" @tap.stop="applyRelatedJob(job)">立即报名</view>
            </view>
          </view>
        </view>
      </view>

      <view class="job-reminder">
        <view class="job-wechat">
          <view class="job-wechat-main">
            <AppIcon name="lucide:wechat" size="66rpx" />
          </view>
        </view>
        <view class="job-reminder-copy">
          <text class="job-reminder-title">开启微信提醒</text>
          <text class="job-reminder-desc">不错过重要求职消息！</text>
        </view>
        <view class="job-reminder-btn tap">立即开启</view>
        <text class="job-reminder-close">×</text>
      </view>

      <view class="job-action-bar">
        <view class="job-chat-btn tap" @tap="openJobContact">立即沟通</view>
        <view class="job-apply-btn tap" @tap="contact">立即报名</view>
      </view>
    </view>

    <view v-else-if="item && isHouseDetail" class="house-detail">
      <view class="house-detail-nav">
        <view class="house-detail-back tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#111827" size="42rpx" />
        </view>
        <text class="house-detail-nav-title">{{ houseNavTitle }}</text>
      </view>

      <view v-if="isRentHouseDetail" class="rent-detail">
        <swiper v-if="images.length" class="house-detail-cover" indicator-dots>
          <swiper-item v-for="image in images" :key="image">
            <image class="house-detail-image" :src="image" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view v-else class="house-detail-cover house-detail-cover-empty">
          <AppIcon name="lucide:house" color="#FFFFFF" size="108rpx" />
        </view>

        <view class="rent-main-card">
          <text class="rent-detail-title">{{ rentDetailTitle }}</text>
          <view class="rent-price-row">
            <text class="rent-detail-price">{{ housePrice }}</text>
            <text class="rent-price-label">租金</text>
          </view>
          <view class="rent-stat-grid">
            <view v-for="stat in rentStats" :key="stat.label" class="rent-stat-item">
              <text class="rent-stat-value">{{ stat.value }}</text>
              <text class="rent-stat-label">{{ stat.label }}</text>
            </view>
          </view>
          <view class="house-tag-row">
            <text v-for="tag in houseTags" :key="tag" class="house-tag-chip">{{ tag }}</text>
          </view>
        </view>

        <view class="rent-map-card">
          <view class="rent-map-main">
            <text class="rent-map-title">{{ houseCommunity }}</text>
            <text class="rent-map-address">{{ item.address }}</text>
          </view>
          <view class="rent-map-action tap">查看地图</view>
        </view>

        <view class="rent-section-card">
          <text class="house-section-title">看房必读</text>
          <view class="rent-read-row">
            <text class="rent-read-label">看房时间</text>
            <text class="rent-read-value">{{ houseViewingTime }}</text>
          </view>
          <view class="rent-read-row">
            <text class="rent-read-label">付款方式</text>
            <text class="rent-read-value">{{ housePaymentMethod }}</text>
          </view>
          <view class="rent-read-row">
            <text class="rent-read-label">入住时间</text>
            <text class="rent-read-value">{{ houseMoveInTime }}</text>
          </view>
        </view>

        <view class="rent-section-card">
          <text class="house-section-title">房屋介绍</text>
          <text class="rent-intro">{{ houseDescription }}</text>
        </view>

        <view class="rent-section-card">
          <text class="house-section-title">房屋设施</text>
          <view class="facility-grid">
            <view
              v-for="facility in facilityList"
              :key="facility.label"
              class="facility-item"
              :class="{ disabled: !facility.available }"
            >
              <text class="facility-check">{{ facility.available ? '✓' : '×' }}</text>
              <text class="facility-name">{{ facility.label }}</text>
            </view>
          </view>
        </view>

        <view class="house-bottom-bar house-bottom-bar--rent">
          <view class="house-bottom-mini tap">分享</view>
          <view class="house-bottom-mini tap" @tap="favorite">{{ favoriteText }}</view>
          <view class="house-bottom-ghost tap" @tap="bookHouseViewing">预约看房</view>
          <view class="house-bottom-main house-bottom-main--phone tap" @tap="contact">打电话</view>
        </view>
      </view>

      <view v-else class="sale-detail">
        <swiper v-if="images.length" class="sale-detail-cover" indicator-dots>
          <swiper-item v-for="image in images" :key="image">
            <image class="house-detail-image" :src="image" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view v-else class="sale-detail-cover house-detail-cover-empty">
          <AppIcon name="lucide:house" color="#FFFFFF" size="120rpx" />
        </view>

        <view class="sale-main-card">
          <view class="sale-metric-row">
            <view v-for="metric in saleMetrics" :key="metric.label" class="sale-metric">
              <text class="sale-metric-value">{{ metric.value }}</text>
              <text class="sale-metric-label">{{ metric.label }}</text>
            </view>
          </view>
          <view class="sale-title-row">
            <text class="sale-detail-title">{{ item.title }}</text>
            <view class="sale-title-actions">
              <text class="sale-action-text tap" @tap="favorite">{{ favoriteText }}</text>
              <text class="sale-action-text tap">分享</text>
            </view>
          </view>
          <view class="house-tag-row">
            <text v-for="tag in houseTags" :key="tag" class="house-tag-chip">{{ tag }}</text>
          </view>
        </view>

        <view class="sale-info-card">
          <view v-for="row in saleInfoRows" :key="row.label" class="sale-info-row">
            <text class="sale-info-label">{{ row.label }}</text>
            <text class="sale-info-value">{{ row.value }}</text>
          </view>
        </view>

        <view class="sale-book-card">
          <view class="sale-book-main">
            <text class="sale-book-title">预约看房</text>
            <text class="sale-book-desc">提前沟通时间，线下看房更高效</text>
          </view>
          <view class="sale-book-btn tap" @tap="bookHouseViewing">立即预约</view>
        </view>

        <view class="sale-broker-card">
          <view class="sale-broker-avatar">
            <AppIcon name="lucide:user-round" color="#111827" size="42rpx" />
          </view>
          <view class="sale-broker-main">
            <text class="sale-broker-name">{{ housePublisherName }}</text>
            <text class="sale-broker-desc">本地房源发布者，支持预约看房</text>
          </view>
        </view>

        <view class="house-bottom-bar house-bottom-bar--sale">
          <view class="house-bottom-main house-bottom-main--phone tap" @tap="contact">打电话</view>
        </view>
      </view>
    </view>

    <view v-else-if="item && isCommonDetail" class="job-detail common-detail">
      <view class="job-nav">
        <view class="job-nav-btn tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#121826" size="42rpx" />
        </view>
        <text class="job-nav-title">{{ commonNavTitle }}</text>
      </view>

      <view class="job-card job-summary-card">
        <view class="job-safe-row common-safe-row">
          <view class="job-safe-main">
            <view class="job-safe-icon common-safe-icon">
              <AppIcon :name="coverIcon" color="#FFFFFF" size="24rpx" />
            </view>
            <text class="job-safe-title">信息保障</text>
            <text class="job-safe-desc">平台展示本地发布信息 联系前请核实细节</text>
          </view>
          <AppIcon name="lucide:chevron-right" color="#BBC2CE" size="28rpx" />
        </view>
        <text class="job-title">{{ item.title }}</text>
        <text class="job-salary">{{ commonPriceText }}</text>
        <view class="job-tags">
          <text v-for="tag in commonTags" :key="tag" class="job-tag">{{ tag }}</text>
        </view>
        <view class="job-applicants">
          <view class="job-avatar-stack">
            <view v-for="avatar in commonAvatars" :key="avatar" class="job-mini-avatar">{{ avatar }}</view>
          </view>
          <text>{{ commonStatusText }}</text>
        </view>
      </view>

      <view class="job-card job-info-card">
        <view v-for="row in commonInfoRows" :key="row.label" class="job-info-row">
          <view class="job-info-icon">
            <AppIcon :name="row.icon" :color="row.color" size="28rpx" />
          </view>
          <view class="job-info-main">
            <text class="job-info-label">{{ row.label }}</text>
            <text class="job-info-value">{{ row.value }}</text>
            <text v-if="row.extra" class="job-info-extra">{{ row.extra }}</text>
          </view>
          <AppIcon v-if="row.arrow" name="lucide:chevron-right" color="#C6CBD6" size="30rpx" />
        </view>
      </view>

      <view class="job-section-title">信息详情</view>
      <view class="job-card job-description">
        <text v-for="line in commonDetailLines" :key="line" class="job-description-line">{{ line }}</text>
      </view>

      <view v-if="images.length" class="job-section-title">图片</view>
      <view v-if="images.length" class="job-card common-image-card">
        <image v-for="image in images" :key="image" class="common-image" :src="image" mode="aspectFill" />
      </view>

      <view class="job-section-title">发布者</view>
      <view class="job-card job-publisher">
        <view class="job-publisher-main">
          <view class="job-avatar">
            <AppIcon name="lucide:user-round" color="#202A3A" size="42rpx" />
          </view>
          <view class="job-publisher-copy">
            <text class="job-publisher-name">{{ commonPublisherName }}</text>
            <view class="job-auth-row">
              <text class="job-auth-dot">✔</text>
              <text>本地发布</text>
            </view>
          </view>
        </view>
        <view class="job-publisher-line"></view>
        <view class="job-verify-row">
          <text class="job-verify-icon">◎</text>
          <text>{{ commonVerifyText }}</text>
        </view>
      </view>

      <view class="job-card job-tip-card">
        <view class="job-tip-head">
          <view class="job-tip-icon">
            <AppIcon :name="coverIcon" color="#FFFFFF" size="28rpx" />
          </view>
          <text>小贴士</text>
        </view>
        <text class="job-tip-text">{{ commonTipText }}</text>
      </view>

      <view class="job-action-bar">
        <view class="job-chat-btn tap" @tap="favorite">{{ favoriteText }}</view>
        <view class="job-apply-btn tap" @tap="contact">{{ contactText }}</view>
      </view>
    </view>

    <view v-else-if="item" class="detail">
      <view class="detail-hero">
        <view class="detail-nav-btn tap" @tap="goBack">
          <AppIcon name="lucide:chevron-left" color="#121826" size="42rpx" />
        </view>
        <text class="detail-nav-title">{{ detailTitle }}</text>
      </view>

      <swiper v-if="images.length" class="cover cover-swiper" indicator-dots>
        <swiper-item v-for="image in images" :key="image">
          <image class="cover-image" :src="image" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view v-else class="cover">
        <AppIcon :name="coverIcon" color="#FFFFFF" size="104rpx" />
      </view>

      <view class="content">
        <view class="title-row">
          <text class="title">{{ item.title }}</text>
          <text class="tag">{{ item.tag }}</text>
        </view>
        <text class="price">{{ item.price }}</text>
        <text class="summary">{{ item.summary }}</text>

        <view class="chips">
          <text v-for="chip in item.highlights" :key="chip" class="chip">{{ chip }}</text>
        </view>

        <view class="info-list">
          <view class="info-item">
            <text class="label">位置</text>
            <text class="value">{{ item.address }}</text>
          </view>
          <view class="info-item">
            <text class="label">发布时间</text>
            <text class="value">{{ item.time }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系人</text>
            <text class="value">{{ item.contact }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系电话</text>
            <text class="value masked">{{ maskedPhone }}</text>
          </view>
        </view>
      </view>

      <view class="notice card">
        <text class="notice-title">联系前提示</text>
        <text class="notice-text">线下交易请核实信息真实性，涉及定金、转账、证件资料时保持谨慎。</text>
      </view>

      <view class="action-bar">
        <view class="secondary-btn tap" @tap="favorite">{{ favoriteText }}</view>
        <view class="primary-btn tap" @tap="contact">{{ contactText }}</view>
      </view>
    </view>

    <view v-else class="empty card">
      <AppHeader title="详情" subtitle="本地信息详情" back />
      <text>信息不存在或已下架</text>
      <view class="primary-btn tap" @tap="goHome">返回首页</view>
    </view>
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import AppIcon from '../../components/AppIcon.vue'
import { applyJob, getListingDetail, getListingPreview, getListings, toggleFavorite } from '../../utils/api'
import { serviceCategories } from '../../data/catalog'

const jobAreas = ['舞阳县', '源汇区', '郾城区', '召陵区', '临颍县']
const commonDetailTypes = ['convenience', 'yellowPages', 'secondhand']
const commonNavTitles = {
  convenience: '便民详情',
  yellowPages: '服务详情',
  secondhand: '二手详情'
}
const commonTips = {
  convenience: '便民信息涉及拼车、求助、失物等场景，联系前请确认时间、地点和费用，线下见面注意安全。',
  yellowPages: '选择本地服务前请确认服务范围、报价明细和售后方式，涉及预付款时保持谨慎。',
  secondhand: '二手交易建议当面验货，确认成色、配件和售后约定后再付款，避免提前转账。'
}

export default {
  components: { AppHeader, AppIcon },
  data() {
    return {
      type: 'jobs',
      item: null,
      relatedJobs: []
    }
  },
  computed: {
    detailTitle() {
      return this.item && this.item.tag ? this.item.tag : '详情'
    },
    isJobDetail() {
      return this.type === 'jobs' || (this.item && this.item.type === 'jobs')
    },
    isHouseDetail() {
      return this.type === 'houses' || (this.item && this.item.type === 'houses')
    },
    isCommonDetail() {
      const type = this.item && this.item.type ? this.item.type : this.type
      return commonDetailTypes.indexOf(type) !== -1
    },
    isRentHouseDetail() {
      return this.isRentHouse(this.item)
    },
    coverIcon() {
      const category = serviceCategories.find((entry) => entry.type === this.type)
      return category ? category.icon : 'lucide:map-pin'
    },
    maskedPhone() {
      return this.item && this.item.phone ? this.item.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''
    },
    images() {
      return this.item && Array.isArray(this.item.images) ? this.item.images : []
    },
    favoriteText() {
      return this.item && this.item.isFavorite ? '取消收藏' : '收藏'
    },
    contactText() {
      if (this.type === 'jobs') return '投递求职'
      if (this.isCommonDetail) return '立即联系'
      return '联系TA'
    },
    jobSalary() {
      return this.item && this.item.price ? this.item.price : '薪资面议'
    },
    jobPublisherName() {
      return this.item && this.item.contact ? this.item.contact : '本地招聘方'
    },
    jobTags() {
      const tags = this.item && Array.isArray(this.item.highlights) ? this.item.highlights.filter(Boolean) : []
      return this.fillList(tags, ['经验不限', '时间灵活', '可预支'], 5)
    },
    jobAvatars() {
      return ['李', '王', '张']
    },
    jobApplicantText() {
      const rawCount = this.item && (this.item.applicantCount || this.item.applyCount || this.item.applicationsCount)
      const count = Number(rawCount) > 0 ? Number(rawCount) : 12
      return `已有${count}人报名`
    },
    jobInfoRows() {
      const item = this.item || {}
      return [
        {
          label: '工作日期',
          value: item.workDate || this.pickJobText(['天', '周', '长期']) || '每周工作5天以上',
          icon: 'lucide:job-tie',
          color: '#2F80ED'
        },
        {
          label: '工作时段',
          value: item.workTime || this.extractJobTime() || '中班11:00-20:00，晚班17:00-24:00',
          icon: 'lucide:message-circle',
          color: '#7C5CFF'
        },
        {
          label: '地址',
          value: item.address || '本地同城岗位',
          extra: '查看位置',
          icon: 'lucide:map-pin',
          color: '#12B76A',
          arrow: true
        },
        {
          label: '职位要求',
          value: item.requirement || this.pickJobText(['经验', '健康', '年龄']) || '18岁以上，身体健康',
          icon: 'lucide:hand-heart',
          color: '#F79009'
        }
      ]
    },
    jobDetailLines() {
      const item = this.item || {}
      const lines = this.splitJobSummary(item.summary)
      return this.uniqueList(lines.concat([
        item.title ? `岗位：${item.title}` : '',
        item.price ? `薪资：${item.price}` : '',
        item.address ? `地址：${item.address}` : ''
      ])).slice(0, 6)
    },
    commonTypeLabel() {
      const category = serviceCategories.find((entry) => entry.type === this.type)
      return category ? category.label : '本地信息'
    },
    commonNavTitle() {
      return commonNavTitles[this.type] || `${this.commonTypeLabel}详情`
    },
    commonPriceText() {
      return this.item && this.item.price ? this.item.price : '价格面议'
    },
    commonPublisherName() {
      return this.item && this.item.contact ? this.item.contact : '本地用户'
    },
    commonTags() {
      const item = this.item || {}
      const tags = Array.isArray(item.highlights) ? item.highlights.filter(Boolean) : []
      if (item.tag) tags.unshift(item.tag)
      return this.fillList(tags, [this.commonTypeLabel, '本地发布'], 5)
    },
    commonAvatars() {
      const first = this.commonPublisherName ? this.commonPublisherName.slice(0, 1) : '本'
      return this.uniqueList([first, '本', '同']).slice(0, 3)
    },
    commonStatusText() {
      const time = this.item && this.item.time ? this.item.time : '刚刚发布'
      return `${time}更新`
    },
    commonInfoRows() {
      const item = this.item || {}
      return [
        {
          label: '信息类型',
          value: item.tag || this.commonTypeLabel,
          icon: this.coverIcon,
          color: '#2F80ED'
        },
        {
          label: this.commonLocationLabel,
          value: item.address || '本地',
          extra: '查看位置',
          icon: 'lucide:map-pin',
          color: '#12B76A',
          arrow: true
        },
        ...this.commonSpecificRows,
        {
          label: '发布时间',
          value: item.time || '刚刚发布',
          icon: 'lucide:message-circle',
          color: '#7C5CFF'
        },
        {
          label: '联系人',
          value: this.commonPublisherName,
          extra: this.maskedPhone || '电话待确认',
          icon: 'lucide:hand-heart',
          color: '#F79009'
        }
      ]
    },
    commonSpecificRows() {
      const item = this.item || {}
      const rowMap = {
        convenience: [
          { label: '需求时间', value: item.targetTime, icon: 'lucide:message-circle', color: '#7C5CFF' },
          { label: '补充要求', value: item.requirement, icon: 'lucide:hand-heart', color: '#F79009' }
        ],
        yellowPages: [
          { label: '服务时间', value: item.serviceTime, icon: 'lucide:message-circle', color: '#7C5CFF' },
          { label: '服务说明', value: item.serviceNote, icon: 'lucide:hand-heart', color: '#F79009' }
        ],
        secondhand: [
          { label: '物品成色', value: item.condition, icon: 'lucide:message-circle', color: '#7C5CFF' },
          { label: '交易方式', value: item.tradeMode, icon: 'lucide:hand-heart', color: '#F79009' }
        ]
      }
      return (rowMap[this.type] || []).filter((row) => row.value)
    },
    commonLocationLabel() {
      if (this.type === 'yellowPages') return '服务范围'
      if (this.type === 'secondhand') return '交易地点'
      return '位置'
    },
    commonDetailLines() {
      const item = this.item || {}
      const lines = this.splitCommonSummary(item.summary)
      const extraLines = this.commonSpecificRows.map((row) => `${row.label}：${row.value}`)
      return this.uniqueList(lines.concat(extraLines, [
        item.title ? `标题：${item.title}` : '',
        item.price ? `价格：${item.price}` : '',
        item.address ? `${this.commonLocationLabel}：${item.address}` : ''
      ])).slice(0, 7)
    },
    commonVerifyText() {
      if (this.maskedPhone) return `联系方式 ${this.maskedPhone}`
      return '发布者已留下联系方式'
    },
    commonTipText() {
      return commonTips[this.type] || '联系前请核实信息真实性，涉及定金、转账、证件资料时保持谨慎。'
    },
    houseFields() {
      return this.parseHouseSummary(this.item)
    },
    houseNavTitle() {
      if (this.isRentHouseDetail) return `整租 | ${this.houseCommunity}`
      return '二手房详情'
    },
    rentDetailTitle() {
      const tag = this.item && this.item.tag ? this.item.tag : '整租'
      const title = this.item && this.item.title ? this.item.title : this.houseCommunity
      return `${tag} | ${title}`
    },
    housePrice() {
      return this.item && this.item.price ? this.item.price : '价格面议'
    },
    houseCommunity() {
      const community = this.houseField(['小区'], '')
      if (community) return community
      const address = this.item && this.item.address ? String(this.item.address).replace(/^漯河\s*/, '').replace(/^舞阳县\s*/, '') : ''
      return address || '本地小区'
    },
    houseArea() {
      return this.houseField(['面积'], this.pickHouseHighlight('m') || '面积待定')
    },
    houseLayout() {
      return this.houseField(['户型'], this.pickHouseHighlight('室') || '户型待定')
    },
    houseFloor() {
      return this.houseField(['楼层'], '楼层待定')
    },
    houseOrientation() {
      return this.houseField(['朝向'], this.pickHouseHighlight('南') || '朝向待定')
    },
    houseDecoration() {
      return this.houseField(['装修'], this.pickHouseHighlight('装修') || '装修待定')
    },
    housePaymentMethod() {
      return this.houseField(['付款方式'], '面议')
    },
    houseMoveInTime() {
      return this.houseField(['入住时间'], '随时入住')
    },
    houseViewingTime() {
      return this.houseField(['看房时间'], '提前预约')
    },
    housePublisherName() {
      return this.item && this.item.contact ? this.item.contact : '本地房东'
    },
    houseDescription() {
      const desc = this.houseField(['房源描述'], '')
      if (desc) return desc
      const lines = this.item && this.item.summary ? this.splitHouseIntro(this.item.summary) : []
      return lines.length ? lines.join('，') : '房源真实在租，具体配置和看房时间可联系发布者确认。'
    },
    houseTags() {
      const item = this.item || {}
      const tags = Array.isArray(item.highlights) ? item.highlights.slice() : []
      if (item.tag) tags.unshift(item.tag)
      return this.uniqueList(tags).filter((tag) => tag.length <= 10).slice(0, 6)
    },
    facilityList() {
      const tagLine = this.houseField(['房源标签'], '')
      const tags = tagLine ? tagLine.split(/、|,|，/) : []
      const defaults = ['冰箱', '洗衣机', '热水器', '宽带', '沙发', '油烟机', '燃气灶', '可做饭', '电视', '空调', '衣柜', '床', '卫生间', '智能门锁', '阳台', '橱柜']
      const enabled = this.fillList(tags, defaults, 16)
      return enabled.map((label) => ({ label, available: true })).concat([{ label: '暖气', available: false }])
    },
    rentStats() {
      return [
        { label: '户型', value: this.houseLayout },
        { label: '面积', value: this.houseArea },
        { label: '楼层', value: this.houseFloor },
        { label: '朝向', value: this.houseOrientation }
      ]
    },
    saleMetrics() {
      return [
        { label: '总价', value: this.housePrice },
        { label: '户型', value: this.houseLayout },
        { label: '面积', value: this.houseArea }
      ]
    },
    saleInfoRows() {
      return [
        { label: '单价', value: this.houseUnitPrice() },
        { label: '楼层', value: this.houseFloor },
        { label: '朝向', value: this.houseOrientation },
        { label: '装修', value: this.houseDecoration },
        { label: '预算', value: this.housePrice },
        { label: '税费', value: '以实际交易为准' },
        { label: '小区', value: this.houseCommunity },
        { label: '地址', value: this.item && this.item.address ? this.item.address : '本地' }
      ]
    }
  },
  async onLoad(query) {
    this.type = query && query.type ? query.type : 'jobs'
    this.item = null
    this.relatedJobs = []
    if (!query || !query.id) return

    try {
      // 优先走正式详情（计入浏览量、可收藏/报名）；仅在内容未上架时回退预览通道
      const previewToken = this.getStoredPreviewToken(query.id, query.previewToken)
      let data
      try {
        data = await getListingDetail(query.id)
      } catch (error) {
        if (!previewToken) throw error
        data = await getListingPreview(query.id, previewToken)
      }
      this.item = data
      this.type = data.type || this.type
      if (this.isJobDetail) await this.loadRelatedJobs()
    } catch {
      if (this.type === 'houses') this.restoreHousePreview(query.id)
      return
    }
  },
  methods: {
    favorite() {
      if (!this.item || !this.item.id) return
      toggleFavorite(this.item.id)
        .then((data) => {
          this.item.isFavorite = data.favorited
          uni.showToast({ title: data.favorited ? '已收藏' : '已取消收藏', icon: 'none' })
        })
        .catch((error) => {
          uni.showToast({ title: (error && error.message) || '操作失败，请稍后重试', icon: 'none' })
        })
    },
    contact() {
      if (!this.item) return
      if (this.type === 'jobs') {
        applyJob(this.item.id)
          .then(() => {
            uni.showToast({ title: '已记录求职意向', icon: 'none' })
          })
          .catch((error) => {
            uni.showToast({ title: (error && error.message) || '投递失败，请稍后重试', icon: 'none' })
          })
        return
      }
      uni.showModal({
        title: '确认联系',
        content: `将联系 ${this.item.contact || '发布者'}：${this.maskedPhone || '请以页面信息为准'}`,
        showCancel: true,
        success: (res) => {
          if (res.confirm) uni.showToast({ title: '请使用电话联系对方', icon: 'none' })
        }
      })
    },
    goHome() {
      uni.reLaunch({ url: '/pages/home/index' })
    },
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/home/index' })
    },
    openJobContact() {
      if (!this.item) return
      uni.showModal({
        title: '立即沟通',
        content: `${this.jobPublisherName}：${this.maskedPhone || '请报名后查看联系方式'}`,
        showCancel: false,
        confirmText: '知道了'
      })
    },
    bookHouseViewing() {
      uni.showToast({ title: '已记录预约意向', icon: 'none' })
    },
    async loadRelatedJobs() {
      try {
        const data = await getListings({ type: 'jobs', pageSize: 8 })
        const currentId = this.item && this.item.id
        this.relatedJobs = ((data && data.items) || []).filter((job) => job.id !== currentId).slice(0, 4)
      } catch {
        this.relatedJobs = []
      }
    },
    openRelatedJob(job) {
      if (!job || !job.id) return
      uni.navigateTo({ url: `/pages/detail/index?type=jobs&id=${job.id}` })
    },
    applyRelatedJob(job) {
      if (!job || !job.id) return
      applyJob(job.id)
        .then(() => {
          uni.showToast({ title: '已记录求职意向', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '投递失败，请稍后重试', icon: 'none' })
        })
    },
    relatedJobTags(job) {
      const tags = job && Array.isArray(job.highlights) ? job.highlights.filter(Boolean) : []
      return this.fillList(tags, job && job.tag ? [job.tag] : ['经验不限'], 4)
    },
    relatedCompanyName(job) {
      return job && job.contact ? job.contact : '本地招聘企业'
    },
    relatedCompanyInitial(job) {
      const name = this.relatedCompanyName(job)
      return name ? name.slice(0, 1) : '企'
    },
    relatedAddress(job) {
      const address = job && job.address ? String(job.address).trim() : '本地'
      const matchedArea = jobAreas.find((area) => address.indexOf(area) === 0)
      if (matchedArea) {
        const detail = address.slice(matchedArea.length).trim()
        return detail ? `${matchedArea} ${detail}` : matchedArea
      }
      return `舞阳县 ${address}`
    },
    getStoredPreviewToken(id, queryToken) {
      if (queryToken) return queryToken
      const tokens = uni.getStorageSync('listingPreviewTokens') || {}
      return tokens[id] || ''
    },
    restoreHousePreview(id) {
      const item = uni.getStorageSync('housePreviewItem')
      if (item && item.id === id) {
        this.item = item
        this.type = 'houses'
      }
    },
    fillList(source, fallback, limit) {
      return this.uniqueList(source.concat(fallback)).slice(0, limit)
    },
    uniqueList(source) {
      return source
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item, index, list) => item && list.indexOf(item) === index)
    },
    pickJobText(keywords) {
      const item = this.item || {}
      const source = this.uniqueList([item.summary].concat(Array.isArray(item.highlights) ? item.highlights : []))
      return source.find((text) => keywords.some((keyword) => text.indexOf(keyword) !== -1)) || ''
    },
    isRentHouse(item) {
      const text = this.houseSearchText(item)
      return text.indexOf('租') !== -1 || text.indexOf('元/月') !== -1 || text.indexOf('出租方式') !== -1
    },
    houseSearchText(item) {
      if (!item) return ''
      const chips = Array.isArray(item.highlights) ? item.highlights.join(' ') : ''
      return `${item.title || ''} ${item.tag || ''} ${item.price || ''} ${item.address || ''} ${item.summary || ''} ${chips}`
    },
    parseHouseSummary(item) {
      const map = {}
      const summary = item && item.summary ? String(item.summary) : ''
      summary.split(/\n|；|;/).forEach((line) => {
        const parts = line.split(/[:：]/)
        if (parts.length < 2) return
        const key = parts.shift().trim()
        const value = parts.join('：').trim()
        if (key && value) map[key] = value
      })
      return map
    },
    houseField(keys, fallback) {
      for (let index = 0; index < keys.length; index += 1) {
        const value = this.houseFields[keys[index]]
        if (value) return value
      }
      return fallback || ''
    },
    pickHouseHighlight(keyword) {
      const item = this.item || {}
      const highlights = Array.isArray(item.highlights) ? item.highlights : []
      return highlights.find((entry) => String(entry).indexOf(keyword) !== -1) || ''
    },
    houseUnitPrice() {
      const price = this.housePrice || ''
      const priceMatch = String(price).match(/(\d+(\.\d+)?)/)
      const areaMatch = String(this.houseArea).match(/(\d+(\.\d+)?)/)
      if (priceMatch && areaMatch) {
        const unit = Math.round((Number(priceMatch[1]) * 10000) / Number(areaMatch[1]))
        if (unit > 0) return `${unit}元/㎡`
      }
      return '单价面议'
    },
    splitHouseIntro(summary) {
      if (!summary) return []
      return this.uniqueList(String(summary).split(/\n|。|；|;/))
        .filter((line) => line.indexOf('：') === -1 && line.indexOf(':') === -1)
        .slice(0, 3)
    },
    extractJobTime() {
      const summary = this.item && this.item.summary ? this.item.summary : ''
      const match = summary.match(/(\d{1,2}[:：]\d{2}|\d{1,2}点).*?(\d{1,2}[:：]\d{2}|\d{1,2}点)/)
      return match ? match[0] : ''
    },
    splitJobSummary(summary) {
      if (!summary) return ['岗位真实在招，到岗前请与招聘方确认工作时间、薪资结算和具体要求。']
      return this.uniqueList(summary.split(/\n|。|；|;/)).map((line) => (/[。！？!?]$/.test(line) ? line : `${line}。`))
    },
    splitCommonSummary(summary) {
      if (!summary) return ['暂无详细描述，请联系发布者了解更多信息。']
      return this.uniqueList(String(summary).split(/\n|。|；|;/)).map((line) => (/[。！？!?]$/.test(line) ? line : `${line}。`))
    }
  }
}
</script>

<style scoped>
.detail-page {
  padding-bottom: 188rpx;
}

.house-detail-page {
  overflow-x: hidden;
  min-height: 100vh;
  padding: 0 18rpx 220rpx;
  background: #f5f6f8;
}

.house-detail {
  padding-top: calc(88rpx + env(safe-area-inset-top));
  padding-bottom: 160rpx;
}

.house-detail-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  height: calc(88rpx + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 6rpx 18rpx rgba(17, 24, 39, 0.04);
}

.house-detail-back {
  position: absolute;
  bottom: 12rpx;
  left: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.house-detail-nav-title {
  position: absolute;
  right: 120rpx;
  bottom: 18rpx;
  left: 120rpx;
  overflow: hidden;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 44rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.house-detail-cover,
.sale-detail-cover {
  display: block;
  overflow: hidden;
  margin: 0 -18rpx;
  background: linear-gradient(135deg, #3fd487 0%, #b8f2d3 100%);
}

.house-detail-cover {
  height: 430rpx;
}

.sale-detail-cover {
  height: 520rpx;
}

.house-detail-image {
  display: block;
  width: 100%;
  height: 100%;
}

.house-detail-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rent-main-card,
.rent-section-card,
.rent-map-card,
.sale-main-card,
.sale-info-card,
.sale-book-card,
.sale-broker-card {
  margin-top: 18rpx;
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(17, 24, 39, 0.05);
}

.rent-main-card {
  padding: 28rpx 24rpx 26rpx;
}

.rent-detail-title,
.sale-detail-title {
  display: block;
  color: #111827;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 46rpx;
}

.rent-price-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-top: 18rpx;
}

.rent-detail-price {
  color: #f04438;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 52rpx;
}

.rent-price-label {
  color: #9ca3af;
  font-size: 22rpx;
}

.rent-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 24rpx;
  padding-top: 22rpx;
  border-top: 2rpx solid #f1f5f9;
}

.rent-stat-item {
  min-width: 0;
  text-align: center;
}

.rent-stat-value {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 25rpx;
  font-weight: 800;
  line-height: 34rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rent-stat-label {
  display: block;
  margin-top: 6rpx;
  color: #8a94a6;
  font-size: 21rpx;
  line-height: 30rpx;
}

.house-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;
}

.house-tag-chip {
  height: 38rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 21rpx;
  line-height: 38rpx;
}

.rent-map-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
}

.rent-map-main {
  flex: 1;
  min-width: 0;
}

.rent-map-title {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.rent-map-address {
  display: block;
  overflow: hidden;
  margin-top: 6rpx;
  color: #8a94a6;
  font-size: 23rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rent-map-action,
.sale-book-btn {
  flex-shrink: 0;
  height: 58rpx;
  padding: 0 20rpx;
  border-radius: 15rpx;
  background: #eefcf5;
  color: #1fc56f;
  font-size: 24rpx;
  line-height: 58rpx;
}

.rent-section-card {
  padding: 26rpx 24rpx;
}

.house-section-title {
  display: block;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 42rpx;
}

.rent-read-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 20rpx 0 0;
}

.rent-read-label {
  flex-shrink: 0;
  color: #8a94a6;
  font-size: 24rpx;
  line-height: 34rpx;
}

.rent-read-value {
  flex: 1;
  color: #111827;
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: right;
}

.rent-intro {
  display: block;
  margin-top: 16rpx;
  color: #4b5563;
  font-size: 25rpx;
  line-height: 42rpx;
}

.facility-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 34rpx 8rpx;
  margin-top: 28rpx;
}

.facility-item {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #30343b;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 38rpx;
}

.facility-item.disabled {
  color: #c7c9cc;
}

.facility-check {
  flex-shrink: 0;
  width: 28rpx;
  margin-right: 6rpx;
  font-size: 27rpx;
  line-height: 38rpx;
  text-align: center;
}

.facility-name {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sale-main-card {
  margin-top: -70rpx;
  padding: 28rpx 24rpx;
  position: relative;
  z-index: 2;
}

.sale-metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.sale-metric {
  min-width: 0;
  text-align: center;
}

.sale-metric-value {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 33rpx;
  font-weight: 900;
  line-height: 44rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sale-metric:first-child .sale-metric-value {
  color: #f04438;
}

.sale-metric-label {
  display: block;
  margin-top: 8rpx;
  color: #8a94a6;
  font-size: 22rpx;
  line-height: 30rpx;
}

.sale-title-row {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f1f5f9;
}

.sale-detail-title {
  flex: 1;
  min-width: 0;
}

.sale-title-actions {
  display: flex;
  flex-shrink: 0;
  gap: 14rpx;
}

.sale-action-text {
  color: #6b7280;
  font-size: 22rpx;
  line-height: 34rpx;
}

.sale-info-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 8rpx 24rpx 20rpx;
}

.sale-info-row {
  min-width: 0;
  padding-top: 22rpx;
}

.sale-info-label {
  display: block;
  color: #9ca3af;
  font-size: 22rpx;
  line-height: 30rpx;
}

.sale-info-value {
  display: block;
  overflow: hidden;
  margin-top: 6rpx;
  color: #111827;
  font-size: 25rpx;
  font-weight: 600;
  line-height: 34rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sale-book-card,
.sale-broker-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
}

.sale-book-main,
.sale-broker-main {
  flex: 1;
  min-width: 0;
}

.sale-book-title,
.sale-broker-name {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.sale-book-desc,
.sale-broker-desc {
  display: block;
  overflow: hidden;
  margin-top: 6rpx;
  color: #8a94a6;
  font-size: 22rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sale-broker-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f1f5f9;
}

.house-bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 18rpx calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -10rpx 28rpx rgba(17, 24, 39, 0.08);
}

.house-bottom-bar--sale {
  gap: 18rpx;
}

.house-bottom-mini,
.house-bottom-ghost,
.house-bottom-main {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 78rpx;
  border-radius: 15rpx;
  font-size: 24rpx;
  font-weight: 700;
  white-space: nowrap;
}

.house-bottom-mini {
  flex: 0 0 82rpx;
  color: #4b5563;
}

.house-bottom-ghost {
  flex: 0 0 142rpx;
  background: #eefcf5;
  color: #1fc56f;
}

.house-bottom-main {
  flex: 1;
  min-width: 0;
  background: #1fc56f;
  color: #ffffff;
}

.house-bottom-main--phone {
  background: #ff7a1a;
}

.job-detail-page {
  min-height: 100vh;
  padding: 0 24rpx 300rpx;
  background: #f1f3f8;
}

.job-detail {
  padding-top: 112rpx;
  padding-bottom: 300rpx;
}

.job-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 88rpx;
  z-index: 60;
  background: #f1f3f8;
  color: #111827;
}

.job-nav-btn {
  position: absolute;
  top: 12rpx;
  left: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  z-index: 2;
}

.job-nav-title {
  position: absolute;
  top: 20rpx;
  right: 0;
  left: 0;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 48rpx;
  pointer-events: none;
  text-align: center;
}

.job-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 26rpx rgba(21, 32, 53, 0.06);
}

.job-summary-card {
  padding-top: 0;
  overflow: hidden;
}

.job-safe-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 -24rpx 24rpx;
  padding: 20rpx 24rpx;
  background: linear-gradient(90deg, #fff3dc 0%, #fff9ee 100%);
}

.job-safe-main {
  display: flex;
  align-items: center;
  min-width: 0;
}

.job-safe-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background: #ff9f29;
}

.job-safe-title {
  flex-shrink: 0;
  margin-left: 12rpx;
  color: #8a4b12;
  font-size: 24rpx;
  font-weight: 500;
}

.job-safe-desc {
  overflow: hidden;
  margin-left: 12rpx;
  color: #a66a29;
  font-size: 22rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.job-title {
  display: block;
  color: #111827;
  font-size: 38rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.job-salary {
  display: block;
  margin-top: 14rpx;
  color: #ff4d4f;
  font-size: 40rpx;
  font-weight: 800;
  line-height: 50rpx;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.job-tag {
  height: 40rpx;
  padding: 0 16rpx;
  border-radius: 8rpx;
  background: #f2f4f7;
  color: #4b5563;
  font-size: 21rpx;
  line-height: 40rpx;
}

.job-applicants {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  color: #8a93a3;
  font-size: 22rpx;
}

.job-avatar-stack {
  display: flex;
  align-items: center;
  margin-right: 14rpx;
}

.job-mini-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  margin-left: -10rpx;
  border: 2rpx solid #ffffff;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 20rpx;
  font-weight: 500;
}

.job-mini-avatar:first-child {
  margin-left: 0;
}

.job-info-card {
  padding: 6rpx 24rpx;
}

.job-info-row {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f1f3f7;
}

.job-info-row:last-child {
  border-bottom: 0;
}

.job-info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.job-info-main {
  flex: 1;
  min-width: 0;
}

.job-info-label {
  display: block;
  color: #8b95a5;
  font-size: 22rpx;
  line-height: 30rpx;
}

.job-info-value {
  display: block;
  margin-top: 8rpx;
  color: #171f2f;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 36rpx;
}

.job-info-extra {
  display: block;
  margin-top: 8rpx;
  color: #12b76a;
  font-size: 22rpx;
  line-height: 30rpx;
}

.job-section-title {
  margin: 26rpx 4rpx 12rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 40rpx;
}

.job-description {
  margin-top: 0;
}

.job-description-line {
  display: block;
  color: #384152;
  font-size: 25rpx;
  line-height: 42rpx;
}

.job-publisher {
  margin-top: 0;
}

.job-publisher-main {
  display: flex;
  align-items: center;
}

.job-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #f0f3f8;
}

.job-publisher-copy {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.job-publisher-name {
  display: block;
  color: #111827;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 36rpx;
}

.job-auth-row {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  color: #8b95a5;
  font-size: 22rpx;
}

.job-auth-dot {
  margin-right: 8rpx;
  color: #12b76a;
}

.job-publisher-line {
  height: 2rpx;
  margin: 24rpx 0;
  background: #f1f3f7;
}

.job-verify-row {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 23rpx;
  line-height: 34rpx;
}

.job-verify-icon {
  margin-right: 10rpx;
  color: #12b76a;
}

.job-tip-card {
  margin-top: 24rpx;
  background: #fffdf7;
}

.job-tip-head {
  display: flex;
  align-items: center;
  color: #111827;
  font-size: 26rpx;
  font-weight: 500;
}

.job-tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  margin-right: 12rpx;
  border-radius: 50%;
  background: #ff9f29;
}

.job-tip-text {
  display: block;
  margin-top: 16rpx;
  color: #6b7280;
  font-size: 23rpx;
  line-height: 36rpx;
}

.common-safe-row {
  background: linear-gradient(90deg, #ecfff5 0%, #ffffff 100%);
}

.common-safe-icon {
  background: #1fc56f;
}

.common-image-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 0;
}

.common-image {
  display: block;
  width: 100%;
  height: 210rpx;
  border-radius: 18rpx;
  background: #f0f3f8;
}

.related-section {
  margin-top: 34rpx;
}

.related-tabs {
  display: flex;
  align-items: center;
  gap: 58rpx;
  margin: 0 8rpx 24rpx;
}

.related-tab {
  position: relative;
  color: #8b95a5;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 52rpx;
}

.related-tab.active {
  color: #10233f;
  font-weight: 900;
}

.related-tab.active::after {
  content: "";
  position: absolute;
  bottom: -8rpx;
  left: 0;
  width: 84rpx;
  height: 8rpx;
  border-radius: 8rpx;
  background: #05d98d;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.related-card {
  padding: 28rpx 28rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.related-head {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.related-title {
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

.related-salary {
  flex: 0 0 auto;
  color: #ff5666;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 42rpx;
  white-space: nowrap;
}

.related-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 14rpx;
  overflow: hidden;
}

.related-tag {
  flex: 0 0 auto;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 8rpx;
  background: #f0f2f7;
  color: #596273;
  font-size: 20rpx;
  line-height: 34rpx;
  white-space: nowrap;
}

.related-bottom {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 16rpx;
}

.related-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: #237cff;
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 500;
}

.related-main {
  flex: 1;
  min-width: 0;
}

.related-company-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

.related-company {
  overflow: hidden;
  max-width: 280rpx;
  color: #10233f;
  font-size: 23rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-verify {
  height: 28rpx;
  padding: 0 8rpx;
  border-radius: 14rpx;
  background: #dbeafe;
  color: #1677ff;
  font-size: 18rpx;
  line-height: 28rpx;
  white-space: nowrap;
}

.related-address {
  display: block;
  overflow: hidden;
  max-width: 390rpx;
  margin-top: 4rpx;
  color: #7c8798;
  font-size: 22rpx;
  line-height: 30rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-apply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 142rpx;
  height: 60rpx;
  border-radius: 15rpx;
  background: #dcfbf2;
  color: #04c987;
  font-size: 24rpx;
  font-weight: 800;
  white-space: nowrap;
}

.job-reminder {
  position: fixed;
  right: 22rpx;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  left: 22rpx;
  z-index: 50;
  display: flex;
  align-items: center;
  min-height: 108rpx;
  padding: 22rpx 66rpx 22rpx 26rpx;
  border-radius: 24rpx;
  background: linear-gradient(100deg, #f3fff0 0%, #ffffff 42%, #ffffff 100%);
  color: #10233f;
  box-shadow: 0 12rpx 36rpx rgba(17, 24, 39, 0.12);
}

.job-wechat {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 92rpx;
  height: 70rpx;
}

.job-wechat-main {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 2rpx;
  left: 2rpx;
  width: 66rpx;
  height: 66rpx;
}


.job-reminder-copy {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.job-reminder-title {
  display: block;
  color: #10233f;
  font-size: 27rpx;
  font-weight: 800;
  line-height: 36rpx;
}

.job-reminder-desc {
  display: block;
  margin-top: 6rpx;
  color: #657184;
  font-size: 22rpx;
  line-height: 30rpx;
}

.job-reminder-btn {
  flex-shrink: 0;
  height: 50rpx;
  padding: 0 28rpx;
  border-radius: 15rpx;
  background: #05d98d;
  color: #10233f;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 50rpx;
}

.job-reminder-close {
  position: absolute;
  top: 14rpx;
  right: 18rpx;
  color: #a5adba;
  font-size: 46rpx;
  font-weight: 300;
  line-height: 46rpx;
}

.job-action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  z-index: 40;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -10rpx 28rpx rgba(21, 32, 53, 0.08);
}

.job-chat-btn,
.job-apply-btn {
  height: 88rpx;
  border-radius: 15rpx;
  font-size: 30rpx;
  line-height: 88rpx;
  text-align: center;
}

.job-chat-btn {
  background: #f2f4f7;
  color: #111827;
}

.job-apply-btn {
  background: #1fc56f;
  color: #ffffff;
  box-shadow: 0 10rpx 22rpx rgba(31, 197, 111, 0.28);
}

.detail-hero {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 88rpx;
  z-index: 60;
  color: #111827;
}

.detail {
  padding-top: 112rpx;
}

.detail-nav-btn {
  position: absolute;
  top: 12rpx;
  left: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  z-index: 2;
}

.detail-nav-title {
  position: absolute;
  top: 20rpx;
  right: 120rpx;
  left: 120rpx;
  overflow: hidden;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 48rpx;
  pointer-events: none;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260rpx;
  margin-top: 24rpx;
  border-radius: 40rpx;
  background:
    radial-gradient(circle at 74% 16%, rgba(255, 255, 255, 0.76) 0, rgba(255, 255, 255, 0) 120rpx),
    linear-gradient(135deg, #20d962 0%, #9af556 100%);
  color: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(121, 248, 157, 0.35);
}

.cover-swiper {
  display: block;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.content {
  margin-top: 24rpx;
  padding: 32rpx;
  border-radius: 36rpx;
  background: #ffffff;
  box-shadow: 0 16rpx 42rpx rgba(41, 91, 53, 0.08);
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.title {
  flex: 1;
  color: #1a1a1a;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 52rpx;
}

.price {
  display: block;
  margin-top: 18rpx;
  color: #ff9f29;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 52rpx;
}

.summary {
  display: block;
  margin-top: 20rpx;
  color: #333333;
  font-size: 30rpx;
  line-height: 44rpx;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 24rpx;
}

.chip {
  height: 52rpx;
  padding: 0 22rpx;
  border-radius: 26rpx;
  background: #ecfff1;
  color: #20c95a;
  font-size: 24rpx;
  line-height: 52rpx;
}

.info-list {
  margin-top: 28rpx;
  border-top: 2rpx solid #e8f3ed;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f7f2;
}

.label {
  color: #999999;
  font-size: 28rpx;
}

.value {
  flex: 1;
  color: #333333;
  font-size: 28rpx;
  text-align: right;
}

.masked {
  color: #34d19d;
  font-weight: 600;
}

.notice {
  margin-top: 24rpx;
  padding: 28rpx;
  background: linear-gradient(135deg, #fffaf0 0%, #fff5df 100%);
}

.notice-title {
  display: block;
  color: #ff9f29;
  font-size: 30rpx;
  font-weight: 700;
}

.notice-text {
  display: block;
  margin-top: 10rpx;
  color: #666666;
  font-size: 26rpx;
  line-height: 36rpx;
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: 220rpx 1fr;
  gap: 20rpx;
  z-index: 30;
  padding: 18rpx 32rpx calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(248, 252, 249, 0.96);
  box-shadow: 0 -10rpx 28rpx rgba(41, 91, 53, 0.08);
}

.empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 28rpx;
  margin-top: 80rpx;
  padding: 48rpx 32rpx;
  color: #666666;
}
</style>
