<template>
  <section>
    <div class="page-head">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <template v-if="activeTab === 'settings'">
        <el-form :model="settingsForm" label-width="132px" class="max-w-980px">
          <div class="form-grid">
            <el-form-item label="小程序名称" required>
              <el-input v-model="settingsForm.appName" />
            </el-form-item>
            <el-form-item label="平台 Logo">
              <el-input v-model="settingsForm.logo" placeholder="图片 URL" />
            </el-form-item>
            <el-form-item label="运营城市">
              <el-input v-model="settingsForm.city" placeholder="舞阳、周边乡镇" />
            </el-form-item>
            <el-form-item label="客服电话">
              <el-input v-model="settingsForm.customerServicePhone" />
            </el-form-item>
            <el-form-item label="客服微信">
              <el-input v-model="settingsForm.customerWechat" />
            </el-form-item>
            <el-form-item label="客服 QQ">
              <el-input v-model="settingsForm.customerQq" />
            </el-form-item>
            <el-form-item label="人工审核分类" class="is-wide">
              <el-checkbox-group v-model="settingsForm.auditRequiredTypes">
                <el-checkbox-button v-for="item in contentResources" :key="item.type" :label="item.type">
                  {{ item.shortLabel }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="敏感词策略">
              <el-select v-model="settingsForm.sensitiveStrategy">
                <el-option label="转人工审核" value="manual" />
                <el-option label="直接拒绝" value="reject" />
              </el-select>
            </el-form-item>
            <el-form-item label="新用户限制小时">
              <el-input-number v-model="settingsForm.newUserPublishDelayHours" :min="0" />
            </el-form-item>
            <el-form-item label="用户协议" class="is-wide">
              <el-input v-model="settingsForm.userAgreement" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="隐私政策" class="is-wide">
              <el-input v-model="settingsForm.privacyPolicy" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="关于我们" class="is-wide">
              <el-input v-model="settingsForm.aboutUs" type="textarea" :rows="4" />
            </el-form-item>
          </div>
          <el-button type="primary" :loading="submitting" @click="saveSettings">保存配置</el-button>
        </el-form>
      </template>

      <template v-if="activeTab === 'words'">
        <div class="toolbar">
          <el-input v-model="wordInput" placeholder="新增敏感词" />
          <el-button type="primary" @click="addWord">新增</el-button>
          <el-input v-model="wordBatch" type="textarea" :rows="1" placeholder="批量添加，逗号或换行分隔" />
          <el-button @click="addWords">批量添加</el-button>
        </div>
        <el-table v-loading="loading" :data="sensitiveWords" row-key="id">
          <el-table-column prop="word" label="敏感词" min-width="180" />
          <el-table-column prop="hitCount" label="命中次数" width="120" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="danger" @click="removeWord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'notices'">
        <div class="toolbar">
          <el-button type="primary" @click="openNotice()">发布公告</el-button>
        </div>
        <el-table v-loading="loading" :data="notices" row-key="id">
          <el-table-column prop="title" label="标题" min-width="180" />
          <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="openNotice(row)">编辑</el-button>
              <el-button link type="danger" @click="removeNotice(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'roles'">
        <div class="toolbar">
          <el-button type="primary" @click="openRole()">新增角色</el-button>
        </div>
        <el-table v-loading="loading" :data="roles" row-key="id">
          <el-table-column prop="name" label="角色名称" width="160" />
          <el-table-column prop="code" label="角色编码" width="180" />
          <el-table-column prop="description" label="说明" min-width="220" />
          <el-table-column label="权限" min-width="260">
            <template #default="{ row }">
              <el-space wrap>
                <el-tag v-for="item in rolePermissionNames(row)" :key="item">{{ item }}</el-tag>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="openRole(row)">编辑</el-button>
              <el-button link type="danger" @click="removeRole(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'accounts'">
        <div class="toolbar">
          <el-input v-model="accountQuery.keyword" clearable placeholder="账号/昵称/手机号" @keyup.enter="loadAccounts" />
          <el-button type="primary" @click="loadAccounts">查询</el-button>
          <el-button @click="openAccount()">新增管理员</el-button>
        </div>
        <el-table v-loading="loading" :data="accounts" row-key="id">
          <el-table-column prop="username" label="账号" width="160" />
          <el-table-column prop="nickname" label="昵称" width="160" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column label="角色" min-width="220">
            <template #default="{ row }">
              <el-tag v-for="role in row.roles || []" :key="role.id" class="mr-1">{{ role.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="openAccount(row)">编辑</el-button>
              <el-button link type="danger" @click="removeAccount(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'logs'">
        <div class="toolbar">
          <el-input v-model="logQuery.keyword" clearable placeholder="操作人/对象/IP" @keyup.enter="loadLogs" />
          <el-input v-model="logQuery.action" clearable placeholder="操作类型" @keyup.enter="loadLogs" />
          <el-button type="primary" :loading="loading" @click="loadLogs">查询</el-button>
          <el-button :loading="exporting" @click="exportLogs">导出</el-button>
        </div>
        <el-table v-loading="loading" :data="logs" row-key="id">
          <el-table-column prop="operator" label="操作人" width="140" />
          <el-table-column prop="action" label="操作类型" width="180" />
          <el-table-column prop="target" label="操作对象" min-width="220" show-overflow-tooltip />
          <el-table-column prop="ip" label="IP" width="140" />
          <el-table-column label="操作时间" width="190">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="logQuery.page"
            v-model:page-size="logQuery.pageSize"
            :page-sizes="[20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            :total="logTotal"
            @change="loadLogs"
          />
        </div>
      </template>

      <template v-if="activeTab === 'menus'">
        <div class="toolbar">
          <el-button type="primary" @click="openMenu()">新增菜单</el-button>
        </div>
        <el-table v-loading="loading" :data="menuTreeRows" row-key="id" default-expand-all>
          <el-table-column prop="title" label="菜单名称" min-width="180" />
          <el-table-column prop="path" label="路由路径" min-width="220" show-overflow-tooltip />
          <el-table-column prop="icon" label="图标" width="120" />
          <el-table-column prop="permission" label="权限标识" min-width="160" show-overflow-tooltip />
          <el-table-column prop="sortOrder" label="排序" width="90" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button link type="primary" @click="openMenu(row)">编辑</el-button>
              <el-button link type="danger" @click="removeMenu(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <el-dialog v-model="noticeDialog" :title="noticeForm.id ? '编辑公告' : '发布公告'" width="620px">
      <el-form :model="noticeForm" label-width="92px">
        <el-form-item label="公告标题" required>
          <el-input v-model="noticeForm.title" maxlength="128" show-word-limit />
        </el-form-item>
        <el-form-item label="公告内容" required>
          <el-input v-model="noticeForm.content" type="textarea" :rows="5" maxlength="5000" show-word-limit />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="noticeForm.status">
            <el-radio-button label="enabled">启用</el-radio-button>
            <el-radio-button label="disabled">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveNotice">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialog" :title="roleForm.id ? '编辑角色' : '新增角色'" width="640px">
      <el-form :model="roleForm" label-width="92px">
        <el-form-item label="角色名称" required><el-input v-model="roleForm.name" /></el-form-item>
        <el-form-item label="角色编码" required><el-input v-model="roleForm.code" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="roleForm.description" /></el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="roleForm.permissions">
            <el-checkbox v-for="item in permissions" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="accountDialog" :title="accountForm.id ? '编辑管理员' : '新增管理员'" width="640px">
      <el-form :model="accountForm" label-width="92px">
        <el-form-item label="账号" required><el-input v-model="accountForm.username" /></el-form-item>
        <el-form-item label="密码" :required="!accountForm.id"><el-input v-model="accountForm.password" show-password /></el-form-item>
        <el-form-item label="昵称" required><el-input v-model="accountForm.nickname" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="accountForm.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="accountForm.email" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="accountForm.status">
            <el-radio-button label="active">正常</el-radio-button>
            <el-radio-button label="banned">封禁</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="accountForm.roleIds">
            <el-checkbox v-for="role in roles" :key="role.id" :label="role.id">{{ role.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="accountDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveAccount">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="menuDialog" :title="menuForm.id ? '编辑菜单' : '新增菜单'" width="640px">
      <el-form :model="menuForm" label-width="92px">
        <el-form-item label="上级菜单">
          <el-select v-model="menuForm.parentId" clearable placeholder="一级菜单">
            <el-option v-for="item in parentMenuOptions" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" required><el-input v-model="menuForm.title" /></el-form-item>
        <el-form-item label="路由路径" required><el-input v-model="menuForm.path" placeholder="/system/menus" /></el-form-item>
        <el-form-item label="组件标识"><el-input v-model="menuForm.component" placeholder="可选，用于后续动态路由扩展" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="menuForm.icon" placeholder="Element Plus 图标名" /></el-form-item>
        <el-form-item label="权限标识"><el-input v-model="menuForm.permission" placeholder="menu:manage" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="menuForm.sortOrder" :min="0" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="menuForm.status">
            <el-radio-button label="enabled">启用</el-radio-button>
            <el-radio-button label="disabled">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="menuDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveMenu">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  addSensitiveWordApi,
  addSensitiveWordsApi,
  createAdminMenuApi,
  createAdminAccountApi,
  createNoticeApi,
  createRoleApi,
  deleteAdminAccountApi,
  deleteAdminMenuApi,
  deleteNoticeApi,
  deleteRoleApi,
  deleteSensitiveWordApi,
  exportOperationLogsApi,
  getSettingsApi,
  listAdminAccountsApi,
  listAdminMenusApi,
  listNoticesApi,
  listOperationLogsApi,
  listPermissionsApi,
  listRolesApi,
  listSensitiveWordsApi,
  type AdminMenuItem,
  type NoticeItem,
  type OperationLogItem,
  type PermissionItem,
  type RoleItem,
  type SensitiveWordItem,
  updateAdminAccountApi,
  updateAdminMenuApi,
  updateNoticeApi,
  updateRoleApi,
  updateRolePermissionsApi,
  updateSettingsApi
} from '@/api/modules/system'
import type { UserItem } from '@/api/modules/user'
import { confirmAction, errorMessage, successMessage } from '@/composables/useConfirmAction'
import { downloadTextFile } from '@/utils/download'
import { contentResources, formatDate, statusLabels, statusTypes } from '@/utils/labels'

const route = useRoute()
const activeTab = computed(() => String(route.meta.section || 'settings'))
const loading = ref(false)
const submitting = ref(false)
const exporting = ref(false)
const settingsForm = reactive<Record<string, any>>({
  appName: '',
  logo: '',
  city: '',
  customerServicePhone: '',
  customerWechat: '',
  customerQq: '',
  auditRequiredTypes: [],
  sensitiveStrategy: 'manual',
  newUserPublishDelayHours: 0,
  userAgreement: '',
  privacyPolicy: '',
  aboutUs: ''
})
const sensitiveWords = ref<SensitiveWordItem[]>([])
const notices = ref<NoticeItem[]>([])
const roles = ref<RoleItem[]>([])
const permissions = ref<PermissionItem[]>([])
const accounts = ref<UserItem[]>([])
const logs = ref<OperationLogItem[]>([])
const menus = ref<AdminMenuItem[]>([])
const logTotal = ref(0)
const wordInput = ref('')
const wordBatch = ref('')
const noticeDialog = ref(false)
const roleDialog = ref(false)
const accountDialog = ref(false)
const menuDialog = ref(false)
const roleForm = reactive<Record<string, any>>({ permissions: [] })
const accountForm = reactive<Record<string, any>>({ status: 'active', roleIds: [] })
const menuForm = reactive<Record<string, any>>({ status: 'enabled', sortOrder: 0 })
const accountQuery = reactive({ page: 1, pageSize: 20, keyword: '' })
const logQuery = reactive({ page: 1, pageSize: 20, keyword: '', action: '' })
const noticeForm = reactive<Partial<NoticeItem>>({ title: '', content: '', status: 'enabled' })
const pageTitle = computed(() => {
  const map: Record<string, string> = {
    settings: '平台配置',
    words: '敏感词',
    notices: '公告通知',
    roles: '角色权限',
    accounts: '管理员账号',
    logs: '操作日志',
    menus: '菜单管理'
  }
  return map[activeTab.value] || '系统管理'
})
const pageDescription = computed(() => {
  const map: Record<string, string> = {
    settings: '维护基础配置、审核策略、协议和客服信息。',
    words: '维护敏感词库并查看命中情况。',
    notices: '发布和编辑用户端公告通知。',
    roles: '维护角色与权限关系。',
    accounts: '维护后台管理员账号和角色。',
    logs: '查看后台操作审计记录。',
    menus: '维护后台侧边栏菜单，前端通过接口读取展示。'
  }
  return map[activeTab.value] || '基础配置、权限账号和操作审计。'
})
const parentMenuOptions = computed(() => menus.value.filter((item) => !item.parentId && item.id !== menuForm.id))
const menuTreeRows = computed(() => buildMenuTree(menus.value))

onMounted(loadActive)

function loadActive() {
  if (activeTab.value === 'settings') return loadSettings()
  if (activeTab.value === 'words') return loadWords()
  if (activeTab.value === 'notices') return loadNotices()
  if (activeTab.value === 'roles') return loadRoles()
  if (activeTab.value === 'accounts') return loadAccounts()
  if (activeTab.value === 'menus') return loadMenus()
  return loadLogs()
}

async function loadSettings() {
  loading.value = true
  try {
    Object.assign(settingsForm, await getSettingsApi())
    if (!Array.isArray(settingsForm.auditRequiredTypes)) settingsForm.auditRequiredTypes = []
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  submitting.value = true
  try {
    await updateSettingsApi(settingsForm)
    successMessage()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function loadWords() {
  loading.value = true
  try {
    sensitiveWords.value = await listSensitiveWordsApi()
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function addWord() {
  if (!wordInput.value.trim()) return
  await addSensitiveWordApi(wordInput.value.trim())
  wordInput.value = ''
  successMessage()
  await loadWords()
}

async function addWords() {
  const words = wordBatch.value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean)
  if (!words.length) return
  await addSensitiveWordsApi(words)
  wordBatch.value = ''
  successMessage()
  await loadWords()
}

async function removeWord(row: SensitiveWordItem) {
  await confirmAction(`确定要删除敏感词“${row.word}”吗？`)
  await deleteSensitiveWordApi(row.id)
  successMessage()
  await loadWords()
}

async function loadNotices() {
  loading.value = true
  try {
    notices.value = await listNoticesApi()
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function openNotice(row?: NoticeItem) {
  Object.keys(noticeForm).forEach((key) => delete (noticeForm as any)[key])
  Object.assign(noticeForm, row || { title: '', content: '', status: 'enabled' })
  noticeDialog.value = true
}

async function saveNotice() {
  if (!noticeForm.title || !noticeForm.content) return errorMessage(new Error('公告标题和内容不能为空'))
  submitting.value = true
  try {
    const payload = {
      title: noticeForm.title || '',
      content: noticeForm.content || '',
      status: noticeForm.status || 'enabled'
    }
    if (noticeForm.id) await updateNoticeApi(noticeForm.id, payload)
    else await createNoticeApi(payload)
    noticeDialog.value = false
    successMessage()
    await loadNotices()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function removeNotice(row: NoticeItem) {
  await confirmAction(`确定要删除公告“${row.title}”吗？`)
  await deleteNoticeApi(row.id)
  successMessage()
  await loadNotices()
}

async function loadRoles() {
  loading.value = true
  try {
    const [roleRows, permissionRows] = await Promise.all([listRolesApi(), listPermissionsApi()])
    roles.value = roleRows
    permissions.value = permissionRows
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function rolePermissionNames(row: RoleItem) {
  return row.permissions?.map((item: any) => item.permission?.name).filter(Boolean) || []
}

function openRole(row?: RoleItem) {
  Object.keys(roleForm).forEach((key) => delete roleForm[key])
  Object.assign(roleForm, row || { code: '', name: '', description: '', permissions: [] })
  roleForm.permissions = row?.permissions?.map((item: any) => item.permissionId || item.permission?.id).filter(Boolean) || []
  roleDialog.value = true
}

async function saveRole() {
  if (!roleForm.name || !roleForm.code) return errorMessage(new Error('角色名称和编码不能为空'))
  submitting.value = true
  try {
    if (roleForm.id) {
      await updateRoleApi(roleForm.id, roleForm)
      await updateRolePermissionsApi(roleForm.id, roleForm.permissions || [])
    } else {
      await createRoleApi(roleForm)
    }
    roleDialog.value = false
    successMessage()
    await loadRoles()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function removeRole(row: RoleItem) {
  await confirmAction(`确定要删除角色“${row.name}”吗？`)
  await deleteRoleApi(row.id)
  successMessage()
  await loadRoles()
}

async function loadAccounts() {
  loading.value = true
  try {
    const [accountRows, roleRows] = await Promise.all([listAdminAccountsApi(accountQuery), listRolesApi()])
    accounts.value = accountRows.items || []
    roles.value = roleRows
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function openAccount(row?: UserItem) {
  Object.keys(accountForm).forEach((key) => delete accountForm[key])
  Object.assign(accountForm, row || { username: '', password: '', nickname: '', status: 'active', roleIds: [] })
  accountForm.roleIds = row?.roles?.map((role) => role.id) || []
  accountDialog.value = true
}

async function saveAccount() {
  if (!accountForm.username || !accountForm.nickname) return errorMessage(new Error('账号和昵称不能为空'))
  if (!accountForm.id && !accountForm.password) return errorMessage(new Error('新增管理员必须设置密码'))
  submitting.value = true
  try {
    if (accountForm.id) await updateAdminAccountApi(accountForm.id, accountForm)
    else await createAdminAccountApi(accountForm)
    accountDialog.value = false
    successMessage()
    await loadAccounts()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function removeAccount(row: UserItem) {
  await confirmAction(`确定要删除管理员账号“${row.username || row.nickname}”吗？此操作不可撤销。`)
  await deleteAdminAccountApi(row.id)
  successMessage()
  await loadAccounts()
}

async function loadLogs() {
  loading.value = true
  try {
    const data = await listOperationLogsApi(logQuery)
    logs.value = data.items || []
    logTotal.value = data.total || 0
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function exportLogs() {
  await confirmAction('确定要导出当前筛选下的操作日志吗？')
  exporting.value = true
  try {
    downloadTextFile(await exportOperationLogsApi(logQuery))
  } catch (error) {
    errorMessage(error)
  } finally {
    exporting.value = false
  }
}

async function loadMenus() {
  loading.value = true
  try {
    menus.value = await listAdminMenusApi({ all: true, flat: true })
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function openMenu(row?: AdminMenuItem) {
  Object.keys(menuForm).forEach((key) => delete menuForm[key])
  Object.assign(menuForm, row || { parentId: null, title: '', path: '', component: '', icon: '', permission: '', sortOrder: 0, status: 'enabled' })
  menuDialog.value = true
}

async function saveMenu() {
  if (!menuForm.title || !menuForm.path) return errorMessage(new Error('菜单名称和路由路径不能为空'))
  submitting.value = true
  try {
    const payload = {
      parentId: menuForm.parentId || null,
      title: menuForm.title,
      path: menuForm.path,
      component: menuForm.component || null,
      icon: menuForm.icon || null,
      permission: menuForm.permission || null,
      sortOrder: Number(menuForm.sortOrder || 0),
      status: menuForm.status || 'enabled'
    }
    if (menuForm.id) await updateAdminMenuApi(menuForm.id, payload)
    else await createAdminMenuApi(payload)
    menuDialog.value = false
    successMessage()
    await loadMenus()
    window.dispatchEvent(new CustomEvent('admin:menus-updated'))
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function removeMenu(row: AdminMenuItem) {
  await confirmAction(`确定要删除菜单“${row.title}”吗？子菜单会同步删除。`)
  await deleteAdminMenuApi(row.id)
  successMessage()
  await loadMenus()
  window.dispatchEvent(new CustomEvent('admin:menus-updated'))
}

function buildMenuTree(items: AdminMenuItem[]) {
  const map = new Map(items.map((item) => [item.id, { ...item, children: [] as AdminMenuItem[] }]))
  const roots: AdminMenuItem[] = []
  for (const item of map.values()) {
    if (item.parentId && map.has(item.parentId)) map.get(item.parentId)!.children!.push(item)
    else roots.push(item)
  }
  return roots
}
</script>
