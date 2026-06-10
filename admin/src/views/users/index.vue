<template>
  <section>
    <div class="page-head">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <template v-if="activeTab === 'users'">
        <div class="toolbar">
          <el-input v-model="userQuery.keyword" clearable placeholder="昵称/手机号/账号" @keyup.enter="loadUsers" />
          <el-select v-model="userQuery.status" clearable placeholder="用户状态">
            <el-option label="全部状态" value="" />
            <el-option label="正常" value="active" />
            <el-option label="已封禁" value="banned" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="loadUsers">查询</el-button>
          <el-button @click="resetUsers">重置</el-button>
          <el-button :loading="exporting" @click="exportUsers">导出</el-button>
          <el-button type="danger" :disabled="!selectedUsers.length" @click="batchUserStatus('banned')">批量封禁</el-button>
          <el-button type="success" :disabled="!selectedUsers.length" @click="batchUserStatus('active')">批量解封</el-button>
        </div>

        <el-table v-loading="loading" :data="users" row-key="id" @selection-change="selectedUsers = $event">
          <el-table-column type="selection" width="42" />
          <el-table-column prop="nickname" label="昵称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publishCount" label="发布数" width="100" />
          <el-table-column prop="favoriteCount" label="收藏数" width="100" />
          <el-table-column label="注册时间" width="180">
            <template #default="{ row }">{{ formatDate(row.registeredAt || row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="190" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" @click="openUser(row)">详情</el-button>
                <el-button link :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleUser(row)">
                  {{ row.status === 'active' ? '封禁' : '解封' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="userQuery.page"
            v-model:page-size="userQuery.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="userTotal"
            @change="loadUsers"
          />
        </div>
      </template>

      <template v-if="activeTab === 'certifications'">
        <div class="toolbar">
          <el-select v-model="certQuery.status" clearable placeholder="审核状态">
            <el-option label="全部状态" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="loadCertifications">查询</el-button>
        </div>
        <el-table v-loading="loading" :data="certifications" row-key="id">
          <el-table-column prop="applicant" label="申请人" min-width="180" />
          <el-table-column prop="type" label="认证类型" width="130" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="material" label="材料" min-width="220" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">{{ formatDate(row.submittedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="success" @click="reviewCertification(row, 'approved')">通过</el-button>
                <el-button link type="danger" @click="reviewCertification(row, 'rejected')">拒绝</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'reports'">
        <div class="toolbar">
          <el-select v-model="reportQuery.status" clearable placeholder="处理状态">
            <el-option label="全部状态" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="handled" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="loadReports">查询</el-button>
        </div>
        <el-table v-loading="loading" :data="reports" row-key="id">
          <el-table-column prop="targetTitle" label="被举报内容" min-width="220" show-overflow-tooltip />
          <el-table-column prop="reason" label="举报理由" min-width="180" show-overflow-tooltip />
          <el-table-column prop="reporter" label="举报人" width="120" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="举报时间" width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="230" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="warning" @click="handleReport(row, true)">违规并下架</el-button>
                <el-button link type="success" @click="handleReport(row, false)">标记处理</el-button>
                <el-button link type="danger" @click="rejectReport(row)">驳回</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <el-drawer v-model="userDrawer" size="460px" title="用户详情">
      <dl v-if="currentUser" class="drawer-list">
        <dt>昵称</dt><dd>{{ currentUser.nickname }}</dd>
        <dt>账号</dt><dd>{{ currentUser.username || '-' }}</dd>
        <dt>手机号</dt><dd>{{ currentUser.phone || '-' }}</dd>
        <dt>邮箱</dt><dd>{{ currentUser.email || '-' }}</dd>
        <dt>状态</dt><dd>{{ statusLabels[currentUser.status] || currentUser.status }}</dd>
        <dt>发布统计</dt><dd>{{ currentUser.publishCount }} 条</dd>
        <dt>浏览统计</dt><dd>{{ currentUser.viewCount }} 次</dd>
        <dt>注册时间</dt><dd>{{ formatDate(currentUser.registeredAt) }}</dd>
        <dt>最后登录</dt><dd>{{ formatDate(currentUser.lastLoginAt) }}</dd>
      </dl>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  batchUserStatusApi,
  exportUsersApi,
  getUserApi,
  listCertificationsApi,
  listReportsApi,
  listUsersApi,
  type CertificationItem,
  type ReportItem,
  type UserItem,
  updateCertificationApi,
  updateReportApi,
  updateUserStatusApi
} from '@/api/modules/user'
import { confirmAction, errorMessage, successMessage } from '@/composables/useConfirmAction'
import { downloadTextFile } from '@/utils/download'
import { formatDate, statusLabels, statusTypes } from '@/utils/labels'

const route = useRoute()
const activeTab = computed(() => String(route.meta.section || 'users'))
const loading = ref(false)
const exporting = ref(false)
const users = ref<UserItem[]>([])
const selectedUsers = ref<UserItem[]>([])
const certifications = ref<CertificationItem[]>([])
const reports = ref<ReportItem[]>([])
const currentUser = ref<UserItem | null>(null)
const userDrawer = ref(false)
const userTotal = ref(0)
const userQuery = reactive({ page: 1, pageSize: 20, keyword: '', status: '' })
const certQuery = reactive({ page: 1, pageSize: 50, status: '' })
const reportQuery = reactive({ page: 1, pageSize: 50, status: '' })
const pageTitle = computed(() => {
  const map: Record<string, string> = { users: '用户列表', certifications: '认证申请', reports: '举报反馈' }
  return map[activeTab.value] || '用户管理'
})
const pageDescription = computed(() => {
  const map: Record<string, string> = {
    users: '管理用户状态、发布数据和账号风控。',
    certifications: '处理实名认证、商家认证和企业资质审核。',
    reports: '处理用户举报反馈，并同步下架违规内容。'
  }
  return map[activeTab.value] || '用户状态、认证和举报统一管理。'
})

onMounted(loadActive)

function loadActive() {
  if (activeTab.value === 'users') return loadUsers()
  if (activeTab.value === 'certifications') return loadCertifications()
  return loadReports()
}

async function loadUsers() {
  loading.value = true
  try {
    const data = await listUsersApi(userQuery)
    users.value = data.items || []
    userTotal.value = data.total || 0
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function loadCertifications() {
  loading.value = true
  try {
    const data = await listCertificationsApi(certQuery)
    certifications.value = data.items || []
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function loadReports() {
  loading.value = true
  try {
    const data = await listReportsApi(reportQuery)
    reports.value = data.items || []
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function resetUsers() {
  Object.assign(userQuery, { page: 1, pageSize: 20, keyword: '', status: '' })
  loadUsers()
}

async function openUser(row: UserItem) {
  currentUser.value = await getUserApi(row.id)
  userDrawer.value = true
}

async function toggleUser(row: UserItem) {
  const status = row.status === 'active' ? 'banned' : 'active'
  await confirmAction(`确定要${status === 'banned' ? '封禁' : '解封'}用户“${row.nickname}”吗？此操作会影响用户发布权限。`)
  await updateUserStatusApi(row.id, status)
  successMessage()
  await loadUsers()
}

async function batchUserStatus(status: string) {
  const ids = selectedUsers.value.map((item) => item.id)
  await confirmAction(`确定要批量${status === 'banned' ? '封禁' : '解封'}选中的 ${ids.length} 个用户吗？`)
  await batchUserStatusApi(ids, status)
  successMessage()
  await loadUsers()
}

async function exportUsers() {
  await confirmAction('确定要导出当前筛选下的用户列表吗？手机号会自动脱敏。')
  exporting.value = true
  try {
    downloadTextFile(await exportUsersApi(userQuery))
  } catch (error) {
    errorMessage(error)
  } finally {
    exporting.value = false
  }
}

async function reviewCertification(row: CertificationItem, status: string) {
  const data: Record<string, unknown> = { status }
  if (status === 'rejected') data.rejectReason = await promptText('请输入拒绝原因')
  await confirmAction(`确定要${status === 'approved' ? '通过' : '拒绝'}“${row.applicant}”的认证申请吗？`)
  await updateCertificationApi(row.id, data)
  successMessage()
  await loadCertifications()
}

async function handleReport(row: ReportItem, downContent: boolean) {
  await confirmAction(`确定要将“${row.targetTitle}”标记为${downContent ? '违规并下架' : '已处理'}吗？系统将生成通知。`)
  await updateReportApi(row.id, {
    status: 'handled',
    result: downContent ? '违规，内容已下架' : '举报已处理',
    downContent
  })
  successMessage()
  await loadReports()
}

async function rejectReport(row: ReportItem) {
  const result = await promptText('请输入驳回说明')
  await confirmAction(`确定要驳回关于“${row.targetTitle}”的举报吗？`)
  await updateReportApi(row.id, { status: 'rejected', result })
  successMessage()
  await loadReports()
}

async function promptText(message: string) {
  const { value } = await ElMessageBox.prompt(message, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '内容不能为空'
  })
  return value
}
</script>
