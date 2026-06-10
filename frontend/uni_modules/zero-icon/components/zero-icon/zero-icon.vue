<template>
  <view class="zero-icon" :style="boxStyle">
    <image
      v-if="iconSrc"
      class="zero-icon__image"
      :src="iconSrc"
      mode="aspectFit"
      @error="handleError"
    />
  </view>
</template>

<script>
export default {
  props: {
    name: { default: '' },
    color: { type: String, default: '#333333' },
    size: { type: [Number, String], default: 16 },
    iconSet: { type: Object, default: null },
    prefix: { type: String, default: '' },
    apiUrl: { type: String, default: '' },
    fallbackName: { type: String, default: '' }
  },
  data() {
    return {
      currentName: this.normalizeIconName(this.name)
    }
  },
  computed: {
    sizeValue() {
      return this.normalizeSize(this.size)
    },
    boxStyle() {
      return {
        width: this.sizeValue,
        height: this.sizeValue
      }
    },
    iconSrc() {
      const normalized = this.normalizeName(this.currentName, this.prefix)
      if (!normalized) return ''
      return this.iconSet ? this.localIconSrc(normalized) : this.remoteIconSrc(normalized)
    }
  },
  watch: {
    name(value) {
      this.currentName = this.normalizeIconName(value)
    }
  },
  methods: {
    normalizeIconName(name) {
      return typeof name === 'string' ? name : ''
    },
    normalizeSize(size) {
      if (typeof size === 'number') return `${size}px`
      return /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size
    },
    normalizeName(name, prefix) {
      const iconName = this.normalizeIconName(name)
      if (!iconName) return ''
      if (iconName.indexOf(':') !== -1 || !prefix) return iconName
      return `${prefix}:${iconName}`
    },
    remoteIconSrc(name) {
      if (!this.apiUrl) return ''
      const parts = name.split(':')
      const prefix = parts[0]
      const icon = parts[1]
      if (!prefix || !icon) return ''
      const base = this.apiUrl.replace(/\/$/, '')
      return `${base}/${prefix}/${icon}.svg?color=${encodeURIComponent(this.color)}`
    },
    localIconSrc(name) {
      const parts = name.split(':')
      const iconName = parts[1] || name
      const icons = this.iconSet && this.iconSet.icons ? this.iconSet.icons : {}
      const icon = icons[iconName]
      if (!icon) return ''
      const width = icon.width || this.iconSet.width || 16
      const height = icon.height || this.iconSet.height || 16
      const svg = icon.fill
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor" style="color:${this.color}">${icon.body}</svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" style="color:${this.color}">${icon.body}</svg>`
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    },
    handleError() {
      if (this.fallbackName && this.currentName !== this.fallbackName) {
        this.currentName = this.fallbackName
      }
    }
  }
}
</script>

<style scoped>
.zero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.zero-icon__image {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
