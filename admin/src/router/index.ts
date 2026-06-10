import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!to.meta.guest && !auth.isLogin) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.guest && auth.isLogin) return '/dashboard'
  if (auth.isLogin && !auth.profile) await auth.loadProfile().catch(() => auth.logout())
  if (to.meta.title && !to.meta.guest) {
    useAppStore().addTab({ path: to.fullPath, title: String(to.meta.title) })
  }
  document.title = `${to.meta.title || '后台'} - 青柠后台`
  return true
})

export default router
