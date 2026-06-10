<script>
export default {}
</script>

<style>
page {
  min-height: 100%;
  background: #f3fff7;
  color: #1a1a1a;
  font-family: PingFang SC, Hiragino Sans GB, Microsoft YaHei, system-ui, sans-serif;
  font-size: 32rpx;
}

view,
text,
scroll-view,
swiper,
input,
textarea {
  box-sizing: border-box;
}

.app-page {
  min-height: 100vh;
  padding: 44rpx 28rpx 168rpx;
  background:
    radial-gradient(circle at 18% 0, rgba(255, 244, 177, 0.62) 0, rgba(255, 244, 177, 0) 220rpx),
    radial-gradient(circle at 96% 4%, rgba(190, 253, 247, 0.8) 0, rgba(190, 253, 247, 0) 260rpx),
    linear-gradient(180deg, #f2fff6 0%, #f8fcf9 520rpx, #f8fcf9 100%);
}

.tap {
  transition: transform 300ms ease-out, opacity 300ms ease-out, box-shadow 300ms ease-out;
}

.tap:active {
  transform: scale(0.96);
  opacity: 0.92;
}

.disabled {
  opacity: 0.58;
  pointer-events: none;
}

.primary-btn {
  height: 88rpx;
  border-radius: 15rpx;
  font-size: 30rpx;
  line-height: 88rpx;
  text-align: center;
  background: #1fc56f;
  color: #ffffff;
  box-shadow: 0 0.3125rem 0.6875rem rgba(31, 197, 111, 0.28);
}

.secondary-btn {
  height: 88rpx;
  border-radius: 15rpx;
  background: #f2f4f7;
  color: #111827;
  font-size: 30rpx;
  line-height: 88rpx;
  text-align: center;
}

.card {
  border: 2rpx solid rgba(255, 255, 255, 0.88);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16rpx 42rpx rgba(41, 91, 53, 0.08);
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: 15rpx;
  background: #ecfff1;
  color: #22c86d;
  font-size: 24rpx;
  white-space: nowrap;
}

.muted {
  color: #666666;
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
