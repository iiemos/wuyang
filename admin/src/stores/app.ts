import { defineStore } from 'pinia'

export interface TabItem {
  path: string
  title: string
}

export const useAppStore = defineStore('app', {
  state: () => ({
    collapsed: false,
    tabs: [{ path: '/dashboard', title: '仪表盘' }] as TabItem[]
  }),
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    addTab(tab: TabItem) {
      if (!this.tabs.some((item) => item.path === tab.path)) this.tabs.push(tab)
    },
    closeTab(path: string) {
      this.tabs = this.tabs.filter((item) => item.path !== path)
      if (!this.tabs.length) this.tabs.push({ path: '/dashboard', title: '仪表盘' })
    }
  }
})
