<template>
  <section>
    <div class="page-head">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
      <el-button v-if="activeTab === 'ads'" type="primary" @click="openPosition()">新增广告位</el-button>
    </div>

    <el-card class="content-card" shadow="never">
      <div class="page-head">
        <div>
          <h2>首页轮播图</h2>
          <span>管理首页轮播广告，支持纯轮播图或轮播图+标题+描述</span>
        </div>
        <el-button type="primary" @click="openAdDialog()">添加轮播图</el-button>
      </div>

      <template v-if="activeTab === 'ads'">
        <el-table v-loading="loading" :data="carouselAds" row-key="id" :default-sort="{ prop: 'createdAt', order: 'descending' }">
          <el-table-column label="轮播图" width="120">
            <template #default="{ row }">
              <el-image :src="assetUrl(row.image)" :preview-src-list="[assetUrl(row.image)]" style="width: 100px; height: 60px" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="120" />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="跳转" width="120">
            <template #default="{ row }">
              <span v-if="row.linkType === 'category'" class="text-sm">分类: {{ row.linkValue }}</span>
              <span v-else-if="row.linkType === 'h5'" class="text-sm">H5链接</span>
              <span v-else class="text-sm">小程序</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">{{ row.status === 'enabled' ? '启用' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openAdDialog(row)">编辑</el-button>
              <el-button link :type="row.status === 'enabled' ? 'danger' : 'success'" size="small" @click="toggleAdStatus(row)">
                {{ row.status === 'enabled' ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click="removeAd(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无轮播图，点击上方「添加轮播图」按钮添加" />
          </template>
        </el-table>
      </template>

      <template v-if="activeTab === 'orders'">
        <el-table v-loading="loading" :data="orders" row-key="id">
          <el-table-column prop="id" label="订单号" min-width="180" show-overflow-tooltip />
          <el-table-column prop="buyer" label="用户/商家" width="140" />
          <el-table-column prop="targetTitle" label="内容标题" min-width="220" show-overflow-tooltip />
          <el-table-column prop="amount" label="金额" width="100" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTypes[row.status]">{{ statusLabels[row.status] || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="开始时间" width="180">
            <template #default="{ row }">{{ formatDate(row.startedAt) }}</template>
          </el-table-column>
          <el-table-column label="到期时间" width="180">
            <template #default="{ row }">{{ formatDate(row.expiredAt) }}</template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'revenue'">
        <div ref="revenueChartRef" class="revenue-chart" />
      </template>
    </el-card>

    <el-dialog v-model="positionDialog" :title="positionForm.id ? '编辑广告位' : '新增广告位'" width="520px">
      <el-form :model="positionForm" label-width="92px">
        <el-form-item label="位置名称" required>
          <el-input v-model="positionForm.name" placeholder="首页轮播图" />
        </el-form-item>
        <el-form-item label="位置标识" required>
          <el-select v-model="positionForm.scene" filterable placeholder="请选择展示位置">
            <el-option v-for="item in positionSceneOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="浏览量">
          <el-input-number v-model="positionForm.pv" :min="0" />
        </el-form-item>
        <el-form-item label="访客数">
          <el-input-number v-model="positionForm.uv" :min="0" />
        </el-form-item>
        <el-form-item label="点击率">
          <el-input v-model="positionForm.ctr" placeholder="0%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="positionDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="savePosition">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="adDialog" :title="adForm.id ? '编辑轮播图' : '添加轮播图'" width="520px" destroy-on-close>
      <el-form :model="adForm" label-width="92px" @submit.prevent="saveAd">
        <el-form-item label="轮播图" required>
          <div class="ad-upload">
            <el-image v-if="adForm.image" :src="assetUrl(adForm.image)" fit="cover" class="ad-upload__preview" />
            <el-upload :http-request="uploadAdImage" :show-file-list="false" accept="image/*" drag>
              <el-icon class="el-icon--upload"><DocumentCopy /></el-icon>
              <div class="el-upload__text">拖动或点击上传图片</div>
              <template #tip>
                <div class="el-upload__tip">只支持 jpg/png/jpeg，单张不超过 5MB</div>
              </template>
            </el-upload>
            <el-input v-if="!adForm.image" v-model="adForm.image" placeholder="或粘贴图片 URL" style="margin-top: 10px" />
          </div>
        </el-form-item>

        <el-form-item label="标题（可选）">
          <el-input v-model="adForm.title" placeholder="轮播图标题，可为空" />
        </el-form-item>

        <el-form-item label="描述（可选）">
          <el-input v-model="adForm.description" type="textarea" :rows="2" placeholder="轮播图描述，可为空" />
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-select v-model="adForm.linkType">
            <el-option label="分类" value="category" />
            <el-option label="H5链接" value="h5" />
            <el-option label="小程序路径" value="miniapp" />
          </el-select>
        </el-form-item>

        <el-form-item label="跳转值">
          <el-select v-if="adForm.linkType === 'category'" v-model="adForm.linkValue" placeholder="选择跳转分类">
            <el-option label="招聘" value="jobs" />
            <el-option label="房源" value="houses" />
            <el-option label="便民" value="convenience" />
            <el-option label="服务" value="yellowPages" />
            <el-option label="二手" value="secondhand" />
            <el-option label="资讯" value="news" />
          </el-select>
          <el-input v-else v-model="adForm.linkValue" :placeholder="`请输入${adForm.linkType === 'h5' ? '完整链接' : '小程序路径'}`" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="adForm.status" active-value="enabled" inactive-value="disabled" />
          <span style="margin-left: 10px">{{ adForm.status === 'enabled' ? '启用' : '禁用' }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="adDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveAd">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getOperationStatsApi, getRevenueStatsApi } from '@/api/modules/dashboard'
import {
  addAdApi,
  createAdPositionApi,
  deleteAdApi,
  deleteAdPositionApi,
  listAdPositionsApi,
  listTopOrdersApi,
  type AdItem,
  type AdPositionItem,
  type TopOrderItem,
  updateAdApi,
  updateAdPositionApi
} from '@/api/modules/operation'
import { assetUrl, uploadFileApi } from '@/api/modules/upload'
import { confirmAction, errorMessage, successMessage } from '@/composables/useConfirmAction'
import { formatDate, statusLabels, statusTypes } from '@/utils/labels'

const route = useRoute()
const activeTab = computed(() => String(route.meta.section || 'ads'))
const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const adPositions = ref<AdPositionItem[]>([])
const orders = ref<TopOrderItem[]>([])
const operationStats = ref<Record<string, any>>({})
const revenueStats = ref<Record<string, any>>({})
const revenueChartRef = ref<HTMLElement>()
const positionDialog = ref(false)
const adDialog = ref(false)
const currentPositionId = ref('')
const adRange = ref<string[]>([])
const positionForm = reactive<Partial<AdPositionItem>>({})
const adForm = reactive<Partial<AdItem>>({ linkType: 'category', linkValue: 'jobs', status: 'enabled' })
const positionSceneOptions = [
  { label: '首页轮播图', value: 'home' },
  { label: '首页精选推荐', value: 'home_featured' },
  { label: '招聘频道广告', value: 'jobs_channel' },
  { label: '房源频道广告', value: 'houses_channel' },
  { label: '便民频道广告', value: 'convenience_channel' },
  { label: '二手频道广告', value: 'secondhand_channel' }
]
const linkCategoryOptions = [
  { label: '招聘', value: 'jobs' },
  { label: '房源', value: 'houses' },
  { label: '便民', value: 'convenience' },
  { label: '服务', value: 'yellowPages' },
  { label: '二手', value: 'secondhand' },
  { label: '资讯', value: 'news' }
]
const pageTitle = computed(() => {
  const map: Record<string, string> = { ads: '广告位管理', orders: '置顶订单', revenue: '收入趋势' }
  return map[activeTab.value] || '运营管理'
})
const pageDescription = computed(() => {
  const map: Record<string, string> = {
    ads: '管理广告位和广告素材，支持图片上传、跳转配置和投放状态。',
    orders: '查看内容置顶订单、到期时间和支付状态。',
    revenue: '查看置顶收入趋势和运营数据。'
  }
  return map[activeTab.value] || '广告位、置顶订单和运营收入统计。'
})

onMounted(loadData)

watch(
  () => [revenueStats.value.trend, activeTab.value],
  () => {
    if (activeTab.value === 'revenue' && revenueChartRef.value) {
      initRevenueChart()
    }
  }
)

function initRevenueChart() {
  const chart = echarts.init(revenueChartRef.value)
  const data = revenueStats.value.trend || []
  const labels = data.map((_: any, i: number) => `近${7 - i}天`)

  const option: echarts.EChartsOption = {
    responsive: true,
    color: ['#19a35b'],
    grid: { left: 40, right: 20, top: 20, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#6d7871' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6d7871' }
    },
    series: [
      {
        data: data.map((v: any) => Number(v) || 0),
        type: 'bar',
        itemStyle: { borderRadius: [6, 6, 0, 0] }
      }
    ]
  }

  chart.setOption(option)
}

async function loadData() {
  loading.value = true
  try {
    const [operation, revenue] = await Promise.all([getOperationStatsApi(), getRevenueStatsApi()])
    operationStats.value = operation || {}
    revenueStats.value = revenue || {}
    if (activeTab.value === 'ads') adPositions.value = await listAdPositionsApi()
    if (activeTab.value === 'orders') orders.value = await listTopOrdersApi()
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function openPosition(row?: AdPositionItem) {
  Object.keys(positionForm).forEach((key) => delete (positionForm as any)[key])
  Object.assign(positionForm, row || { name: '', scene: 'home', pv: 0, uv: 0, ctr: '0%' })
  positionDialog.value = true
}

async function savePosition() {
  if (!positionForm.name || !positionForm.scene) return errorMessage(new Error('广告位名称和标识不能为空'))
  submitting.value = true
  try {
    if (positionForm.id) await updateAdPositionApi(positionForm.id, positionForm)
    else await createAdPositionApi(positionForm)
    successMessage()
    positionDialog.value = false
    await loadData()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function removePosition(row: AdPositionItem) {
  await confirmAction(`确定要删除广告位“${row.name}”吗？此操作会同步删除其广告素材。`)
  await deleteAdPositionApi(row.id)
  successMessage()
  await loadData()
}

function openAd(position: AdPositionItem, ad?: AdItem) {
  currentPositionId.value = position.id
  Object.keys(adForm).forEach((key) => delete (adForm as any)[key])
  Object.assign(adForm, ad || { title: '', image: '', linkType: 'category', linkValue: 'jobs', status: 'enabled' })
  adRange.value = ad?.startAt && ad?.endAt ? [ad.startAt, ad.endAt] : []
  adDialog.value = true
}

async function saveAd() {
  if (!adForm.title) return errorMessage(new Error('广告标题不能为空'))
  submitting.value = true
  try {
    const payload = {
      ...adForm,
      startAt: adRange.value?.[0],
      endAt: adRange.value?.[1]
    }
    if (adForm.id) await updateAdApi(adForm.id, payload)
    else await addAdApi(currentPositionId.value, payload)
    successMessage()
    adDialog.value = false
    await loadData()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function toggleAdStatus(ad: AdItem) {
  await updateAdApi(ad.id, { status: ad.status === 'enabled' ? 'disabled' : 'enabled' })
  successMessage()
  await loadData()
}

async function removeAd(ad: AdItem) {
  await confirmAction(`确定要删除广告“${ad.title}”吗？`)
  await deleteAdApi(ad.id)
  successMessage()
  await loadData()
}

async function uploadAdImage(options: any) {
  uploading.value = true
  try {
    const data = await uploadFileApi(options.file)
    adForm.image = data.url
    options.onSuccess?.(data)
  } catch (error) {
    options.onError?.(error)
    errorMessage(error)
  } finally {
    uploading.value = false
  }
}

function trendLabel(index: number | string) {
  return `近${7 - Number(index)}天`
}
</script>

<style scoped>
.revenue-chart {
  width: 100%;
  height: 300px;
}

.ad-materials {
  display: grid;
  gap: 8px;
}

.ad-chip {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #e4ebe7;
  border-radius: 8px;
  background: #f8fbf9;
  transition: all 0.2s;
}

.ad-chip:hover {
  background: #f0f5f2;
  border-color: #19a35b;
}

.ad-chip__image {
  width: 40px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e4ebe7;
  object-fit: cover;
}

.ad-chip__info {
  min-width: 0;
  display: flex;
  align-items: center;
}

.ad-upload {
  display: grid;
  width: 100%;
  gap: 10px;
}

.ad-upload__preview {
  width: 220px;
  height: 96px;
  border-radius: 8px;
  border: 1px solid #e4ebe7;
}
</style>
