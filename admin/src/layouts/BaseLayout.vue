<template>
  <div class="fa-layout" :class="{ 'is-collapsed': app.collapsed }">
    <aside class="fa-sidebar">
      <div class="brand">
        <span class="brand__mark">青</span>
        <div v-show="!app.collapsed">
          <strong>青柠后台</strong>
          <span>Fantastic Admin</span>
        </div>
      </div>
      <el-scrollbar>
        <el-menu router :default-active="route.path" :collapse="app.collapsed" class="side-menu">
          <template v-for="item in menus" :key="item.path">
            <el-sub-menu v-if="item.children?.length" :index="item.path">
              <template #title>
                <el-icon><component :is="iconMap[String(item.icon)] || Document" /></el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
                <span>{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.path">
              <el-icon><component :is="iconMap[String(item.icon)] || Document" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </aside>

    <section class="fa-main">
      <header class="fa-topbar">
        <div class="topbar-left">
          <el-button text circle @click="app.toggleCollapsed">
            <el-icon><Fold v-if="!app.collapsed" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>青柠本地生活</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-actions">
          <el-button :icon="Refresh" @click="reload">刷新</el-button>
          <el-dropdown>
            <el-button type="primary">
              {{ auth.profile?.nickname || auth.profile?.username || '管理员' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <nav class="fa-tabs">
        <el-tag
          v-for="tab in app.tabs"
          :key="tab.path"
          :closable="app.tabs.length > 1"
          :effect="tab.path === route.fullPath ? 'dark' : 'plain'"
          @click="router.push(tab.path)"
          @close="closeTab(tab.path)"
        >
          {{ tab.title }}
        </el-tag>
      </nav>

      <main class="page-container">
        <RouterView :key="route.fullPath" />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, DataLine, Document, Expand, Fold, Grid, Menu, Refresh, Setting, Star, TrendCharts, User } from '@element-plus/icons-vue'
import { listAdminMenusApi, type AdminMenuItem } from '@/api/modules/system'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const app = useAppStore()
const auth = useAuthStore()
const rawMenus = ref<AdminMenuItem[]>([])
const iconMap: Record<string, Component> = { DataLine, Document, Grid, Menu, Setting, Star, TrendCharts, User }
const fallbackMenus: AdminMenuItem[] = [
  { id: 'dashboard', title: '仪表盘', path: '/dashboard', icon: 'DataLine', sortOrder: 10, status: 'enabled' },
  {
    id: 'content',
    title: '内容管理',
    path: '/content',
    icon: 'Document',
    sortOrder: 20,
    status: 'enabled',
    children: [
      { id: 'content-recruitments', title: '招聘管理', path: '/content/recruitments', sortOrder: 10, status: 'enabled' },
      { id: 'content-houses', title: '房源管理', path: '/content/houses', sortOrder: 20, status: 'enabled' },
      { id: 'content-conveniences', title: '便民信息', path: '/content/conveniences', sortOrder: 30, status: 'enabled' },
      { id: 'content-shops', title: '商家服务', path: '/content/shops', sortOrder: 40, status: 'enabled' },
      { id: 'content-used', title: '二手闲置', path: '/content/used-goods', sortOrder: 50, status: 'enabled' },
      { id: 'content-articles', title: '本地资讯', path: '/content/articles', sortOrder: 60, status: 'enabled' },
      { id: 'content-featured', title: '精选推荐', path: '/content/featured', sortOrder: 70, status: 'enabled' },
      { id: 'content-categories', title: '分类管理', path: '/content/categories', sortOrder: 80, status: 'enabled' }
    ]
  },
  {
    id: 'users',
    title: '用户管理',
    path: '/users',
    icon: 'User',
    sortOrder: 30,
    status: 'enabled',
    children: [
      { id: 'users-list', title: '用户列表', path: '/users/list', sortOrder: 10, status: 'enabled' },
      { id: 'users-certifications', title: '认证申请', path: '/users/certifications', sortOrder: 20, status: 'enabled' },
      { id: 'users-reports', title: '举报反馈', path: '/users/reports', sortOrder: 30, status: 'enabled' }
    ]
  },
  {
    id: 'operation',
    title: '运营管理',
    path: '/operation',
    icon: 'TrendCharts',
    sortOrder: 40,
    status: 'enabled',
    children: [
      { id: 'operation-ads', title: '广告位管理', path: '/operation/ads', sortOrder: 10, status: 'enabled' },
      { id: 'operation-orders', title: '置顶订单', path: '/operation/orders', sortOrder: 20, status: 'enabled' },
      { id: 'operation-revenue', title: '收入趋势', path: '/operation/revenue', sortOrder: 30, status: 'enabled' }
    ]
  },
  {
    id: 'system',
    title: '系统管理',
    path: '/system',
    icon: 'Setting',
    sortOrder: 50,
    status: 'enabled',
    children: [
      { id: 'system-settings', title: '平台配置', path: '/system/settings', sortOrder: 10, status: 'enabled' },
      { id: 'system-words', title: '敏感词', path: '/system/sensitive-words', sortOrder: 20, status: 'enabled' },
      { id: 'system-notices', title: '公告通知', path: '/system/notices', sortOrder: 30, status: 'enabled' },
      { id: 'system-roles', title: '角色权限', path: '/system/roles', sortOrder: 40, status: 'enabled' },
      { id: 'system-accounts', title: '管理员账号', path: '/system/accounts', sortOrder: 50, status: 'enabled' },
      { id: 'system-logs', title: '操作日志', path: '/system/logs', sortOrder: 60, status: 'enabled' },
      { id: 'system-menus', title: '菜单管理', path: '/system/menus', sortOrder: 70, status: 'enabled' }
    ]
  }
]
const permissionSet = computed(() => new Set((auth.profile?.permissions as string[]) || []))
const menus = computed(() => filterMenus(rawMenus.value.length ? rawMenus.value : fallbackMenus))

onMounted(() => {
  loadMenus()
  window.addEventListener('admin:menus-updated', loadMenus)
})
onUnmounted(() => window.removeEventListener('admin:menus-updated', loadMenus))

async function loadMenus() {
  try {
    rawMenus.value = await listAdminMenusApi()
  } catch {
    rawMenus.value = fallbackMenus
  }
}

function filterMenus(items: AdminMenuItem[]): AdminMenuItem[] {
  return items
    .filter((item) => item.status !== 'disabled')
    .map((item) => ({ ...item, children: filterMenus(item.children || []) }))
    .filter((item) => !permissionSet.value.size || !item.permission || permissionSet.value.has(item.permission) || Boolean(item.children?.length))
}

function reload() {
  window.dispatchEvent(new CustomEvent('admin:reload'))
}

function closeTab(path: string) {
  app.closeTab(path)
  if (path === route.fullPath) router.push(app.tabs[app.tabs.length - 1]?.path || '/dashboard')
}

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>
