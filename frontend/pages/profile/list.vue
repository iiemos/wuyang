<template>
  <view class="app-page profile-list-page">
    <view class="list-hero">
      <AppHeader :title="pageTitle" subtitle="个人中心" back />
    </view>

    <template v-if="type === 'reports'">
      <view class="feedback card">
        <textarea v-model="reason" placeholder="请描述要反馈的问题，例如虚假信息、联系不上、价格不实等" />
        <view class="primary-btn tap" :class="{ disabled: submitting }" @tap="submitReport">
          {{ submitting ? '提交中' : '提交反馈' }}
        </view>
      </view>
      <view class="section-head">
        <text class="section-title">反馈记录</text>
      </view>
      <view v-if="reports.length" class="report-list">
        <view v-for="item in reports" :key="item.id" class="report card">
          <view class="report-top">
            <text class="report-title">{{ item.targetTitle }}</text>
            <text class="tag">{{ statusText(item.status) }}</text>
          </view>
          <text class="report-reason">{{ item.reason }}</text>
          <text class="report-time">{{ formatDate(item.createdAt) }}</text>
        </view>
      </view>
      <view v-else class="empty card">暂无反馈记录</view>
    </template>

    <template v-else>
      <view v-if="items.length" class="list">
        <ListingCard v-for="item in items" :key="item.id" :item="item" :type="item.type" variant="standard" />
      </view>
      <view v-else class="empty card">{{ emptyText }}</view>
    </template>
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import ListingCard from '../../components/ListingCard.vue'
import {
  createReport,
  getProfileApplications,
  getProfileFavorites,
  getProfilePublications,
  getProfileReports,
  getProfileViews
} from '../../utils/api'

const titles = {
  publications: '我的发布',
  favorites: '我的收藏',
  views: '浏览记录',
  applications: '我的求职',
  reports: '举报反馈'
}

export default {
  components: { AppHeader, ListingCard },
  data() {
    return {
      type: 'publications',
      items: [],
      reports: [],
      reason: '',
      submitting: false
    }
  },
  computed: {
    pageTitle() {
      return titles[this.type] || '个人中心'
    },
    emptyText() {
      const map = {
        publications: '暂无发布记录',
        favorites: '暂无收藏内容',
        views: '暂无浏览记录',
        applications: '暂无求职记录'
      }
      return map[this.type] || '暂无数据'
    }
  },
  async onLoad(query) {
    this.type = query && query.type ? query.type : 'publications'
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        if (this.type === 'favorites') this.items = await getProfileFavorites()
        else if (this.type === 'views') this.items = await getProfileViews()
        else if (this.type === 'applications') this.items = await getProfileApplications()
        else if (this.type === 'reports') this.reports = await getProfileReports()
        else this.items = await getProfilePublications()
      } catch {
        uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
      }
    },
    async submitReport() {
      if (this.submitting) return
      const text = this.reason.trim()
      if (!text) {
        uni.showToast({ title: '请填写反馈内容', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        await createReport({ reason: text })
        this.reason = ''
        uni.showToast({ title: '已提交反馈', icon: 'none' })
        await this.loadData()
      } catch (error) {
        uni.showToast({ title: (error && error.message) || '提交失败，请稍后重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    statusText(status) {
      const map = { pending: '待处理', handled: '已处理' }
      return map[status] || status
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.list-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 24rpx;
  border-radius: 0 0 44rpx 44rpx;
  background:
    radial-gradient(circle at 84% 14%, rgba(255, 255, 255, 0.74) 0, rgba(255, 255, 255, 0) 190rpx),
    linear-gradient(135deg, #ddffe2 0%, #9af556 100%);
  box-shadow: 0 18rpx 42rpx rgba(92, 206, 73, 0.16);
}

.list,
.report-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 24rpx;
}

.feedback {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
  padding: 28rpx;
}

.feedback textarea {
  width: 100%;
  min-height: 180rpx;
  padding: 22rpx;
  border: 2rpx solid rgba(121, 248, 157, 0.26);
  border-radius: 26rpx;
  background: #f7fff9;
  color: #333333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.section-head {
  margin-top: 30rpx;
}

.section-title {
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 700;
}

.report {
  padding: 30rpx 28rpx;
  border: 0;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.05);
}

.report-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.report-title {
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

.report-reason {
  display: block;
  margin-top: 12rpx;
  color: #596273;
  font-size: 24rpx;
  line-height: 36rpx;
}

.report-time {
  display: block;
  margin-top: 16rpx;
  color: #8a94a6;
  font-size: 21rpx;
  line-height: 30rpx;
}

.empty {
  margin-top: 24rpx;
  padding: 48rpx 32rpx;
  color: #666666;
  font-size: 28rpx;
  text-align: center;
}
</style>
