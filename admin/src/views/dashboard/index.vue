<template>
  <section>
    <div class="page-head">
      <div>
        <h1>仪表盘</h1>
        <p>待审、举报、认证和近期操作集中处理。</p>
      </div>
      <el-button type="primary" :loading="loading" @click="loadData">刷新数据</el-button>
    </div>

    <div class="stats-grid">
      <article v-for="item in stats" :key="item.label" class="stat-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <em>{{ item.trend }}</em>
      </article>
    </div>

    <el-card class="content-card mb-4" shadow="never">
      <div class="panel-title">
        <div>
          <h2>用户数据</h2>
          <span>注册、活跃、风控与发布规模</span>
        </div>
      </div>
      <div class="stats-grid compact">
        <article v-for="item in userStats" :key="item.label" class="stat-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <em>{{ item.trend }}</em>
        </article>
      </div>
    </el-card>

    <el-alert v-if="warningText" :title="warningText" type="warning" show-icon class="mb-4" />

    <div class="split-grid">
      <el-card class="content-card" shadow="never">
        <div class="panel-title">
          <div>
            <h2>待审队列</h2>
            <span>支持筛选、批量通过和批量拒绝</span>
          </div>
          <el-segmented v-model="auditType" :options="auditOptions" />
        </div>
        <div class="toolbar">
          <el-button type="success" :disabled="!selectedAudits.length" @click="batchAudit('approved')">批量通过</el-button>
          <el-button type="danger" :disabled="!selectedAudits.length" @click="batchAudit('rejected')">批量拒绝</el-button>
        </div>
        <el-table v-loading="loading" :data="filteredAudits" row-key="targetId" @selection-change="selectedAudits = $event">
          <el-table-column type="selection" width="42" />
          <el-table-column label="类型" width="90">
            <template #default="{ row }">{{ typeLabels[row.type] || row.type }}</template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
          <el-table-column prop="publisher" label="发布人" width="120" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="success" @click="singleAudit(row, 'approved')">通过</el-button>
                <el-button link type="danger" @click="singleAudit(row, 'rejected')">拒绝</el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty class="empty-box" description="暂无待审数据" />
          </template>
        </el-table>
      </el-card>

      <el-card class="content-card" shadow="never">
        <div class="panel-title">
          <div>
            <h2>发布分析</h2>
            <span>分类发布量与通过率</span>
          </div>
        </div>
        <div v-for="item in publication" :key="item.type" class="mb-5">
          <div class="flex items-center justify-between mb-2 text-sm">
            <strong>{{ item.label }}</strong>
            <span>{{ item.total }} 条 · 通过率 {{ item.passRate }}%</span>
          </div>
          <el-progress :percentage="item.passRate" :stroke-width="10" />
        </div>
      </el-card>
    </div>

    <el-card class="content-card mt-4" shadow="never">
      <div class="panel-title">
        <div>
          <h2>最近操作</h2>
          <span>重要后台操作审计</span>
        </div>
      </div>
      <el-table :data="recentOperations" row-key="id">
        <el-table-column prop="operator" label="操作人" width="140" />
        <el-table-column prop="action" label="操作类型" width="180" />
        <el-table-column prop="target" label="对象" min-width="220" show-overflow-tooltip />
        <el-table-column label="时间" width="190">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getOverviewApi } from '@/api/modules/dashboard'
import { batchContentStatusApi, updateContentStatusApi } from '@/api/modules/content'
import { confirmAction, errorMessage, successMessage } from '@/composables/useConfirmAction'
import { formatDate, resourceByType, statusLabels, statusTypes, typeLabels } from '@/utils/labels'

const loading = ref(false)
const stats = ref<any[]>([])
const userStats = ref<any[]>([])
const audits = ref<any[]>([])
const publication = ref<any[]>([])
const recentOperations = ref<any[]>([])
const selectedAudits = ref<any[]>([])
const auditType = ref('')
const auditOptions = computed(() => [
  { label: '全部', value: '' },
  ...publication.value.map((item) => ({ label: item.label, value: item.type }))
])
const filteredAudits = computed(() => (auditType.value ? audits.value.filter((item) => item.type === auditType.value) : audits.value))
const warningText = computed(() => {
  const danger = publication.value.find((item) => Number(item.pending) > 10)
  return danger ? `${danger.label}待审已超过 10 条，请优先处理。` : ''
})

onMounted(() => {
  loadData()
  window.addEventListener('admin:reload', loadData)
})
onUnmounted(() => window.removeEventListener('admin:reload', loadData))

async function loadData() {
  loading.value = true
  try {
    const data = await getOverviewApi()
    stats.value = data.stats || []
    userStats.value = data.userStats || []
    audits.value = data.audits || []
    publication.value = data.publication || []
    recentOperations.value = data.recentOperations || []
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function singleAudit(row: any, status: string) {
  const resource = resourceByType[row.type]
  if (!resource) return
  const extra = status === 'rejected' ? { rejectReason: await rejectReason() } : {}
  await confirmAction(`确定要${status === 'approved' ? '审核通过' : '拒绝'}“${row.title}”吗？`)
  await updateContentStatusApi(resource, row.targetId, status, extra)
  successMessage()
  await loadData()
}

async function batchAudit(status: string) {
  const rows = selectedAudits.value
  if (!rows.length) return
  const grouped = rows.reduce<Record<string, string[]>>((result, row) => {
    const resource = resourceByType[row.type]
    if (resource) result[resource] = [...(result[resource] || []), row.targetId]
    return result
  }, {})
  const extra = status === 'rejected' ? { rejectReason: await rejectReason() } : {}
  await confirmAction(`确定要批量${status === 'approved' ? '审核通过' : '拒绝'}选中的 ${rows.length} 条信息吗？此操作不可撤销。`)
  await Promise.all(Object.entries(grouped).map(([resource, ids]) => batchContentStatusApi(resource, ids, status, extra)))
  successMessage()
  await loadData()
}

async function rejectReason() {
  const { value } = await ElMessageBox.prompt('请输入拒绝原因', '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '拒绝原因不能为空'
  })
  return value
}
</script>
