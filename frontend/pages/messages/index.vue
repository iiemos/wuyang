<template>
  <view class="app-page messages-page">
    <view class="message-hero">
      <AppHeader title="消息中心" subtitle="审核、咨询、系统通知集中展示" />

      <view class="notice">
        <text class="notice-title">待处理</text>
        <text class="notice-value">{{ unreadCount }}</text>
        <text class="notice-desc">有新的审核和咨询提醒</text>
      </view>
    </view>

    <view class="list">
      <view v-for="item in messages" :key="item.id" class="message card tap">
        <view class="dot" :class="{ muted: !item.unread }" />
        <view class="message-main">
          <view class="message-top">
            <text class="message-title">{{ item.title }}</text>
            <text class="message-time">{{ item.time }}</text>
          </view>
          <text class="message-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <BottomTab active="messages" />
  </view>
</template>

<script>
import AppHeader from '../../components/AppHeader.vue'
import BottomTab from '../../components/BottomTab.vue'
import { getMessages } from '../../utils/api'

export default {
  components: { AppHeader, BottomTab },
  data() {
    return {
      messages: []
    }
  },
  computed: {
    unreadCount() {
      return this.messages.filter((item) => item.unread).length
    }
  },
  onLoad() {
    this.loadMessages()
  },
  methods: {
    async loadMessages() {
      try {
        const data = await getMessages()
        this.messages = data && data.length ? data : this.messages
      } catch {
        return
      }
    }
  }
}
</script>

<style scoped>
.message-hero {
  margin: -44rpx -28rpx 0;
  padding: 50rpx 28rpx 18rpx;
  border-radius: 0 0 44rpx 44rpx;
  background: linear-gradient(135deg, #ddffe2 0%, #f8ffcb 100%);
}

.notice {
  margin-top: 18rpx;
  padding: 32rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.76);
}

.notice-title {
  color: #666666;
  font-size: 24rpx;
}

.notice-value {
  display: block;
  margin-top: 10rpx;
  color: #20c95a;
  font-size: 64rpx;
  font-weight: 700;
  line-height: 72rpx;
}

.notice-desc {
  color: #666666;
  font-size: 24rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
}

.message {
  display: flex;
  gap: 18rpx;
  padding: 28rpx;
}

.dot {
  flex: 0 0 18rpx;
  width: 18rpx;
  height: 18rpx;
  margin-top: 12rpx;
  border-radius: 50%;
  background: #79f89d;
}

.dot.muted {
  background: #e8f3ed;
}

.message-main {
  flex: 1;
  min-width: 0;
}

.message-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.message-title {
  overflow: hidden;
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time,
.message-desc {
  color: #999999;
  font-size: 24rpx;
}

.message-desc {
  display: block;
  margin-top: 10rpx;
  color: #666666;
  font-size: 24rpx;
  line-height: 36rpx;
}
</style>
