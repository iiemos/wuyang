<template>
  <zero-icon :name="safeName" :color="color" :size="size" :icon-set="lucideIconSet" fallback-name="lucide:map-pin" />
</template>

<script>
import { lucideIconSet } from '../data/lucide-icons'

export default {
  props: {
    name: { default: '' },
    color: { type: String, default: '#333333' },
    size: { type: [Number, String], default: 16 }
  },
  computed: {
    safeName() {
      return typeof this.name === 'string' && this.name ? this.name : 'lucide:map-pin'
    }
  },
  data() {
    return { lucideIconSet }
  }
}
</script>
