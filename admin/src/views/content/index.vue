<template>
  <section>
    <div class="page-head">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
      <div class="page-actions">
        <el-button v-if="pageMode === 'categories'" type="primary" @click="openCategoryEditor()">新增分类</el-button>
        <el-button v-else-if="pageMode === 'list'" type="primary" @click="openEditor()">新增内容</el-button>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <template v-if="pageMode === 'categories'">
        <div class="toolbar">
          <el-select v-model="categoryQuery.group" placeholder="内容类型" @change="loadCategories">
            <el-option v-for="item in categoryGroupOptions" :key="item.type" :label="item.shortLabel" :value="item.type" />
          </el-select>
          <el-button type="primary" @click="openCategoryEditor()">新增分类</el-button>
        </div>
        <el-table v-loading="categoryLoading" :data="categoryRows" row-key="id">
          <el-table-column label="内容类型" width="120">
            <template #default="{ row }">{{ categoryGroupLabel(row.group) }}</template>
          </el-table-column>
          <el-table-column prop="name" label="分类名称" min-width="180" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template #default="{ row }">
              <el-button link type="primary" @click="openCategoryEditor(row)">编辑</el-button>
              <el-button link type="danger" @click="removeCategory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else>
        <div class="toolbar">
          <el-input v-model="query.keyword" clearable placeholder="标题/发布人/电话" @keyup.enter="loadData" />
          <el-select v-model="query.status" placeholder="状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-model="query.tag" clearable placeholder="分类/标签" @keyup.enter="loadData" />
          <el-select v-if="pageMode === 'featured'" v-model="query.isRecommended" placeholder="推荐状态" clearable>
            <el-option label="已推荐" value="true" />
            <el-option label="未推荐" value="false" />
          </el-select>
          <el-select v-model="query.sortBy" placeholder="排序字段">
            <el-option label="发布时间" value="createdAt" />
            <el-option label="更新时间" value="updatedAt" />
            <el-option label="置顶权重" value="topPriority" />
            <el-option label="标题" value="title" />
          </el-select>
          <el-select v-model="query.order" placeholder="排序方向">
            <el-option label="降序" value="desc" />
            <el-option label="升序" value="asc" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button v-if="pageMode === 'list'" :loading="exporting" @click="exportRows">导出</el-button>
        </div>

        <div v-if="pageMode === 'list'" class="toolbar">
          <el-button type="success" :disabled="!selectedRows.length" @click="batchStatus('approved')">批量通过</el-button>
          <el-button type="warning" :disabled="!selectedRows.length" @click="batchStatus('offline')">批量下架</el-button>
          <el-button type="danger" :disabled="!selectedRows.length" @click="batchDelete">批量删除</el-button>
          <span class="text-sm text-gray-500">已选 {{ selectedRows.length }} 条，总计 {{ pager.total }} 条</span>
        </div>

        <el-table v-loading="loading" :data="rows" row-key="id" @selection-change="selectedRows = $event">
          <el-table-column v-if="pageMode === 'list'" type="selection" width="42" />
          <el-table-column prop="title" label="标题" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <el-button link type="primary" @click="openDetail(row)">{{ row.title }}</el-button>
            </template>
          </el-table-column>
          <el-table-column v-if="pageMode === 'featured'" label="内容类型" width="110">
            <template #default="{ row }">{{ typeLabels[row.type] || row.type }}</template>
          </el-table-column>
          <el-table-column prop="tag" label="分类" width="110" />
          <el-table-column label="发布人" width="130">
            <template #default="{ row }">{{ row.publisher || row.contact || '-' }}</template>
          </el-table-column>
          <el-table-column prop="phone" label="电话" width="130" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="运营" width="150">
            <template #default="{ row }">
              <el-space wrap>
                <el-tag v-if="row.isTop" type="success">置顶</el-tag>
                <el-tag v-if="row.isRecommended" type="warning">推荐</el-tag>
                <el-tag v-if="row.ownerType">{{ row.ownerType }}</el-tag>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button v-if="pageMode === 'list'" link type="primary" @click="openEditor(row)">编辑</el-button>
                <el-button v-if="pageMode === 'list' && canApprove(row)" link type="success" @click="setStatus(row, 'approved')">通过</el-button>
                <el-button v-if="pageMode === 'list' && canOffline(row)" link type="warning" @click="setStatus(row, 'offline')">下架</el-button>
                <el-button v-if="pageMode === 'list' && canReject(row)" link type="danger" @click="setStatus(row, 'rejected')">拒绝</el-button>
                <el-button v-if="row.status !== 'deleted'" link @click="toggleTop(row)">{{ row.isTop ? '取消置顶' : '置顶' }}</el-button>
                <el-button v-if="showRecommendAction(row)" link @click="toggleRecommend(row)">{{ row.isRecommended ? '取消推荐' : '推荐' }}</el-button>
                <el-button v-if="pageMode === 'list' && row.status !== 'deleted'" link type="danger" @click="deleteRow(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty class="empty-box" description="暂无内容数据" />
          </template>
        </el-table>

        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="query.page"
            v-model:page-size="query.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pager.total"
            @change="loadData"
          />
        </div>
      </template>
    </el-card>

    <el-drawer v-model="detailVisible" size="520px" title="内容详情">
      <dl v-if="currentRow" class="drawer-list">
        <dt>标题</dt><dd>{{ currentRow.title }}</dd>
        <dt>分类</dt><dd>{{ currentRow.tag }}</dd>
        <dt>价格</dt><dd>{{ currentRow.price || '-' }}</dd>
        <dt>地址</dt><dd>{{ currentRow.address || '-' }}</dd>
        <dt>发布人</dt><dd>{{ currentRow.publisher || currentRow.contact }}</dd>
        <dt>电话</dt><dd>{{ currentRow.phone }}</dd>
        <dt>状态</dt><dd>{{ statusLabels[currentRow.status] || currentRow.status }}</dd>
        <dt>摘要</dt><dd>{{ currentRow.summary || '-' }}</dd>
        <dt>标签</dt><dd>{{ currentRow.highlights?.join('、') || '-' }}</dd>
        <dt>图片</dt><dd>{{ currentRow.images?.join('、') || '-' }}</dd>
        <dt>扩展字段</dt><dd><pre class="details-json">{{ formatDetails(currentRow.details) }}</pre></dd>
        <dt>时间</dt><dd>{{ formatDate(currentRow.createdAt) }}</dd>
      </dl>
    </el-drawer>

    <el-dialog v-model="editorVisible" :title="form.id ? '编辑内容' : '新增内容'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
        <div class="form-grid">
          <el-form-item label="标题" prop="title" class="is-wide">
            <el-input v-model="form.title" maxlength="128" show-word-limit />
          </el-form-item>
          <el-form-item label="分类" prop="tag">
            <el-select v-model="form.tag" filterable allow-create default-first-option placeholder="选择或输入分类">
              <el-option v-for="item in editorCategories" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status">
              <el-option label="待审核" value="pending" />
              <el-option label="已发布" value="approved" />
              <el-option label="已下架" value="offline" />
            </el-select>
          </el-form-item>
          <el-form-item label="价格">
            <el-input v-model="form.price" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" />
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="form.contact" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.phone" />
          </el-form-item>
          <el-form-item label="发布人">
            <el-input v-model="form.publisher" />
          </el-form-item>
          <el-form-item label="发布者类型">
            <el-select v-model="form.ownerType" clearable>
              <el-option label="个人" value="个人" />
              <el-option label="企业" value="企业" />
              <el-option label="中介" value="中介" />
            </el-select>
          </el-form-item>
          <el-form-item label="摘要" class="is-wide">
            <el-input v-model="form.summary" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="亮点标签" class="is-wide">
            <el-input v-model="form.highlightsText" placeholder="多个标签用逗号分隔" />
          </el-form-item>
          <el-form-item label="图片链接" class="is-wide">
            <el-input v-model="form.imagesText" type="textarea" :rows="3" placeholder="每行一个图片地址" />
          </el-form-item>
          <el-form-item label="扩展字段" class="is-wide">
            <el-input v-model="form.detailsText" type="textarea" :rows="4" placeholder='JSON，例如 {"workDate":"周末","workTime":"早班"}' />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveRow">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="categoryEditorVisible" :title="categoryForm.id ? '编辑分类' : '新增分类'" width="460px">
      <el-form :model="categoryForm" label-width="92px">
        <el-form-item label="内容类型" required>
          <el-select v-model="categoryForm.group">
            <el-option v-for="item in categoryGroupOptions" :key="item.type" :label="item.shortLabel" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" required>
          <el-input v-model="categoryForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="categoryForm.status">
            <el-radio-button label="enabled">启用</el-radio-button>
            <el-radio-button label="disabled">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryEditorVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySubmitting" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  batchContentStatusApi,
  batchDeleteContentApi,
  createCategoryApi,
  createContentApi,
  deleteCategoryApi,
  deleteContentApi,
  exportContentApi,
  listCategoriesApi,
  listContentApi,
  listFeaturedContentApi,
  type ResourceCategoryItem,
  type ContentItem,
  updateCategoryApi,
  updateContentApi,
  updateContentRecommendApi,
  updateContentTopApi,
  updateContentStatusApi
} from '@/api/modules/content'
import { confirmAction, errorMessage, successMessage } from '@/composables/useConfirmAction'
import { downloadTextFile } from '@/utils/download'
import { contentResources, formatDate, resourceByType, statusLabels, statusOptions, statusTypes, typeLabels } from '@/utils/labels'

interface ContentForm extends Partial<ContentItem> {
  highlightsText?: string
  imagesText?: string
  detailsText?: string
}

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const exporting = ref(false)
const rows = ref<ContentItem[]>([])
const selectedRows = ref<ContentItem[]>([])
const editorCategories = ref<ResourceCategoryItem[]>([])
const categoryRows = ref<ResourceCategoryItem[]>([])
const detailVisible = ref(false)
const editorVisible = ref(false)
const categoryEditorVisible = ref(false)
const currentRow = ref<ContentItem | null>(null)
const formRef = ref<FormInstance>()
const query = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: '',
  tag: '',
  sortBy: 'createdAt',
  order: 'desc' as 'asc' | 'desc',
  isRecommended: ''
})
const pager = reactive({ total: 0 })
const form = reactive<ContentForm>({})
const categoryLoading = ref(false)
const categorySubmitting = ref(false)
const categoryQuery = reactive({ page: 1, pageSize: 100, group: '' })
const categoryForm = reactive<Partial<ResourceCategoryItem>>({})
const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  tag: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  phone: [{ pattern: /^$|^1\d{10}$|^\d{3,4}-?\d{7,8}$/, message: '联系电话格式错误', trigger: 'blur' }]
}
const pageMode = computed(() => String(route.meta.contentMode || 'list'))
const activeResource = computed(() => String(route.meta.resource || 'recruitments'))
const currentResource = computed(() => contentResources.find((item) => item.key === activeResource.value))
const currentResourceLabel = computed(() => currentResource.value?.label || '内容')
const currentContentType = computed(() => currentResource.value?.type || 'jobs')
const categoryGroupOptions = computed(() => contentResources.map((item) => ({ type: item.type, shortLabel: item.shortLabel })))
const pageTitle = computed(() => {
  if (pageMode.value === 'featured') return '精选推荐'
  if (pageMode.value === 'categories') return '分类管理'
  return currentResourceLabel.value
})
const pageDescription = computed(() => {
  if (pageMode.value === 'featured') return '管理首页精选推荐展示内容，可跨招聘、房源、便民、服务和二手内容调整。'
  if (pageMode.value === 'categories') return '维护招聘、房源、便民、二手、服务和资讯的分类选项。'
  if (activeResource.value === 'articles') return '本地资讯支持新增、编辑、审核、下架和删除。'
  return '内容审核、置顶、推荐和状态管理。'
})

onMounted(() => {
  if (pageMode.value === 'categories') {
    categoryQuery.group = currentContentType.value
    loadCategories()
  } else {
    loadData()
  }
  window.addEventListener('admin:reload', loadData)
})
onUnmounted(() => window.removeEventListener('admin:reload', loadData))

async function loadData() {
  if (pageMode.value === 'categories') return loadCategories()
  loading.value = true
  try {
    const data = pageMode.value === 'featured'
      ? await listFeaturedContentApi(query)
      : await listContentApi(activeResource.value, query)
    rows.value = data.items || []
    pager.total = data.total || 0
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  Object.assign(query, { page: 1, pageSize: 20, keyword: '', status: '', tag: '', sortBy: 'createdAt', order: 'desc', isRecommended: '' })
  loadData()
}

function openDetail(row: ContentItem) {
  currentRow.value = row
  detailVisible.value = true
}

function openEditor(row?: ContentItem) {
  Object.keys(form).forEach((key) => delete (form as any)[key])
  Object.assign(form, row || { status: 'pending', tag: '', title: '', contact: '', phone: '' })
  form.highlightsText = row?.highlights?.join('，') || ''
  form.imagesText = row?.images?.join('\n') || ''
  form.detailsText = row?.details ? JSON.stringify(row.details, null, 2) : ''
  loadEditorCategories()
  editorVisible.value = true
}

async function saveRow() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const details = parseDetailsText(form.detailsText)
    if (details === false) return
    const payload = {
      ...form,
      highlights: form.highlightsText?.split(/[，,]/).map((item) => item.trim()).filter(Boolean),
      images: form.imagesText?.split(/\n|[，,]/).map((item) => item.trim()).filter(Boolean),
      details
    }
    delete (payload as any).highlightsText
    delete (payload as any).imagesText
    delete (payload as any).detailsText
    if (form.id) await updateContentApi(resourceKey(form), form.id, payload)
    else await createContentApi(activeResource.value, payload)
    successMessage()
    editorVisible.value = false
    await loadData()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function setStatus(row: ContentItem, status: string) {
  const extra = await statusExtra(status)
  await confirmAction(`确定要将“${row.title}”设置为${statusLabels[status] || status}吗？此操作会影响用户端展示。`)
  await updateContentStatusApi(resourceKey(row), row.id, status, extra)
  successMessage()
  await loadData()
}

async function batchStatus(status: string) {
  const ids = selectedRows.value.map((item) => item.id)
  const extra = await statusExtra(status)
  await confirmAction(`确定要批量${statusLabels[status] || status}选中的 ${ids.length} 条${currentResourceLabel.value}吗？此操作不可撤销。`)
  await batchContentStatusApi(activeResource.value, ids, status, extra)
  successMessage()
  await loadData()
}

async function statusExtra(status: string) {
  if (!['rejected', 'offline'].includes(status)) return {}
  const label = status === 'rejected' ? '拒绝原因' : '下架原因'
  const { value } = await ElMessageBox.prompt(`请输入${label}`, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: `${label}不能为空`
  })
  return status === 'rejected' ? { rejectReason: value } : { offlineReason: value }
}

async function deleteRow(row: ContentItem) {
  await confirmAction(`确定要删除“${row.title}”吗？此操作不可撤销。`)
  await deleteContentApi(resourceKey(row), row.id)
  successMessage()
  await loadData()
}

function canApprove(row: ContentItem) {
  return ['pending', 'rejected', 'offline'].includes(row.status)
}

function canOffline(row: ContentItem) {
  return row.status === 'approved'
}

function canReject(row: ContentItem) {
  return row.status === 'pending'
}

async function batchDelete() {
  const ids = selectedRows.value.map((item) => item.id)
  await confirmAction(`确定要批量删除选中的 ${ids.length} 条${currentResourceLabel.value}吗？此操作不可撤销。`)
  await batchDeleteContentApi(activeResource.value, ids)
  successMessage()
  await loadData()
}

async function toggleTop(row: ContentItem) {
  await confirmAction(`确定要${row.isTop ? '取消置顶' : '置顶'}“${row.title}”吗？`)
  await updateContentTopApi(row.id, {
    isTop: !row.isTop,
    topPriority: row.isTop ? 0 : 9,
    topExpireAt: row.isTop ? null : new Date(Date.now() + 7 * 86400000).toISOString()
  })
  successMessage()
  await loadData()
}

async function toggleRecommend(row: ContentItem) {
  await confirmAction(`确定要${row.isRecommended ? '取消推荐' : '推荐'}“${row.title}”吗？`)
  await updateContentRecommendApi(row.id, { isRecommended: !row.isRecommended })
  successMessage()
  await loadData()
}

async function exportRows() {
  await confirmAction(`确定要导出当前筛选下的${currentResourceLabel.value}数据吗？`)
  exporting.value = true
  try {
    downloadTextFile(await exportContentApi(activeResource.value, query))
  } catch (error) {
    errorMessage(error)
  } finally {
    exporting.value = false
  }
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    const data = await listCategoriesApi(categoryQuery)
    categoryRows.value = data.items || []
    if (categoryQuery.group === currentContentType.value) editorCategories.value = categoryRows.value.filter((item) => item.status === 'enabled')
  } catch (error) {
    errorMessage(error)
  } finally {
    categoryLoading.value = false
  }
}

async function loadEditorCategories() {
  try {
    const data = await listCategoriesApi({ page: 1, pageSize: 100, group: currentContentType.value })
    editorCategories.value = (data.items || []).filter((item) => item.status === 'enabled')
  } catch {
    editorCategories.value = []
  }
}

function openCategoryEditor(row?: ResourceCategoryItem) {
  Object.keys(categoryForm).forEach((key) => delete (categoryForm as any)[key])
  Object.assign(categoryForm, row || { group: categoryQuery.group || currentContentType.value, name: '', status: 'enabled' })
  categoryEditorVisible.value = true
}

async function saveCategory() {
  if (!categoryForm.group || !categoryForm.name) return errorMessage(new Error('内容类型和分类名称不能为空'))
  categorySubmitting.value = true
  try {
    const payload = {
      group: categoryForm.group,
      name: categoryForm.name,
      status: categoryForm.status || 'enabled'
    }
    if (categoryForm.id) await updateCategoryApi(categoryForm.id, payload)
    else await createCategoryApi(payload)
    categoryEditorVisible.value = false
    successMessage()
    await loadCategories()
    await loadEditorCategories()
  } catch (error) {
    errorMessage(error)
  } finally {
    categorySubmitting.value = false
  }
}

async function removeCategory(row: ResourceCategoryItem) {
  await confirmAction(`确定要删除分类“${row.name}”吗？已有内容不会被删除。`)
  await deleteCategoryApi(row.id)
  successMessage()
  await loadCategories()
  await loadEditorCategories()
}

function categoryGroupLabel(type: string) {
  return contentResources.find((item) => item.type === type)?.shortLabel || type
}

function resourceKey(row: Partial<ContentItem>) {
  return row.type ? resourceByType[row.type] || activeResource.value : activeResource.value
}

function showRecommendAction(row: ContentItem) {
  return row.type !== 'news' && row.status !== 'deleted'
}

function parseDetailsText(value?: string) {
  const text = (value || '').trim()
  if (!text) return null
  try {
    const data = JSON.parse(text)
    if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('扩展字段必须是 JSON 对象')
    return data as Record<string, unknown>
  } catch (error) {
    errorMessage(error instanceof Error ? error : new Error('扩展字段 JSON 格式错误'))
    return false
  }
}

function formatDetails(value?: Record<string, unknown> | null) {
  return value && Object.keys(value).length ? JSON.stringify(value, null, 2) : '-'
}
</script>

<style scoped>
.details-json {
  max-height: 240px;
  overflow: auto;
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f6f8fb;
  color: #334155;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
