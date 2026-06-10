import { defineStore } from 'pinia'
import { clearToken, getToken } from '@/api/request'
import { loginApi, profileApi, type LoginPayload } from '@/api/modules/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    profile: null as Record<string, any> | null
  }),
  getters: {
    isLogin: (state) => Boolean(state.token)
  },
  actions: {
    async login(payload: LoginPayload) {
      const data = await loginApi(payload)
      this.token = data.token
      this.profile = (data.admin || data.user || null) as Record<string, any> | null
    },
    async loadProfile() {
      if (!this.token) return
      this.profile = await profileApi()
    },
    logout() {
      clearToken()
      this.token = ''
      this.profile = null
    }
  }
})
