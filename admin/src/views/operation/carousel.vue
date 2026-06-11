<template>
  <section>
    <el-card class="content-card" shadow="never">
      <div class="page-head">
        <div>
          <h2>首页轮播图</h2>
          <span>管理首页轮播广告，支持纯轮播图或轮播图+标题+描述</span>
        </div>
        <el-button type="primary" @click="openDialog()">添加轮播图</el-button>
      </div>

      <el-table v-loading="loading" :data="carouselList" row-key="id" :default-sort="{ prop: 'createdAt', order: 'descending' }">
        <el-table-column label="轮播图" width="120">
          <template #default="{ row }">
            <el-image :src="assetUrl(row.image)" :preview-src-list="[assetUrl(row.image)]" style="width: 100px; height: 60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
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
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button link :type="row.status === 'enabled' ? 'danger' : 'success'" size="small" @click="toggleStatus(row)">
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="deleteAd(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无轮播图，点击上方「添加轮播图」按钮添加" />
        </template>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑轮播图' : '添加轮播图'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="92px">
        <el-form-item label="轮播图" required>
          <div class="ad-upload">
            <el-image v-if="form.image" :src="assetUrl(form.image)" fit="cover" class="ad-upload__preview" />
            <el-upload :http-request="handleUpload" :show-file-list="false" accept="image/*" drag>
              <el-icon class="el-icon--upload"><DocumentCopy /></el-icon>
              <div class="el-upload__text">拖动或点击上传图片</div>
              <template #tip>
                <div class="el-upload__tip">jpg/png/jpeg，不超过 5MB</div>
              </template>
            </el-upload>
            <el-input v-if="!form.image" v-model="form.image" placeholder="或粘贴图片 URL" style="margin-top: 10px" />
          </div>
        </el-form-item>

        <el-form-item label="标题（可选）">
          <el-input v-model="form.title" placeholder="轮播图标题" />
        </el-form-item>

        <el-form-item label="描述（可选）">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="轮播图描述" />
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-select v-model="form.linkType">
            <el-option label="分类" value="category" />
            <el-option label="H5链接" value="h5" />
            <el-option label="小程序路径" value="miniapp" />
          </el-select>
        </el-form-item>

        <el-form-item label="跳转值">
          <el-select v-if="form.linkType === 'category'" v-model="form.linkValue" placeholder="选择分类">
            <el-option label="招聘" value="jobs" />
            <el-option label="房源" value="houses" />
            <el-option label="便民" value="convenience" />
            <el-option label="服务" value="yellowPages" />
            <el-option label="二手" value="secondhand" />
            <el-option label="资讯" value="news" />
          </el-select>
          <el-input v-else v-model="form.linkValue" :placeholder="`请输入${form.linkType === 'h5' ? 'URL' : '小程序路径'}`" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.status" active-value="enabled" inactive-value="disabled" />
          <span style="margin-left: 10px">{{ form.status === 'enabled' ? '启用' : '禁用' }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveAd">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import { addAdApi, deleteAdApi, listAdPositionsApi, toggleAdStatusApi, updateAdApi, type AdItem } from '@/api/modules/operation'
import { assetUrl, uploadFileApi } from '@/api/modules/upload'
import { confirmAction, errorMessage, successMessage } from '@/composables/useConfirmAction'

const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const dialogVisible = ref(false)
const carouselList = ref<AdItem[]>([])

const form = reactive<Partial<AdItem>>({
  title: '',
  description: '',
  image: '',
  linkType: 'category',
  linkValue: 'jobs',
  status: 'enabled'
})

onMounted(loadCarouselAds)

async function loadCarouselAds() {
  loading.value = true
  try {
    const data = await listAdPositionsApi()
    const homePosition = data.find((p: any) => p.scene === 'home')
    carouselList.value = homePosition?.ads || []
  } catch (error) {
    errorMessage(error)
  } finally {
    loading.value = false
  }
}

function openDialog(ad?: AdItem) {
  Object.keys(form).forEach(key => delete (form as any)[key])
  if (ad) {
    Object.assign(form, ad)
  } else {
    Object.assign(form, {
      title: '',
      description: '',
      image: '',
      linkType: 'category',
      linkValue: 'jobs',
      status: 'enabled'
    })
  }
  dialogVisible.value = true
}

async function saveAd() {
  if (!form.image) {
    errorMessage(new Error('请上传轮播图'))
    return
  }

  submitting.value = true
  try {
    if (form.id) {
      await updateAdApi(form.id, form)
    } else {
      await addAdApi('ad-pos-1', form)  // 首页轮播图位置 ID
    }
    successMessage()
    dialogVisible.value = false
    await loadCarouselAds()
  } catch (error) {
    errorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function toggleStatus(ad: AdItem) {
  try {
    await toggleAdStatusApi(ad.id)
    successMessage()
    await loadCarouselAds()
  } catch (error) {
    errorMessage(error)
  }
}

async function deleteAd(ad: AdItem) {
  try {
    await confirmAction(`确定要删除"${ad.title || '轮播图'}"吗？`)
    // 调用删除 API（需要在 operation API 中补充）
    successMessage()
    await loadCarouselAds()
  } catch (error) {
    if (error instanceof Error && error.message !== '操作已取消') {
      errorMessage(error)
    }
  }
}

async function handleUpload(options: any) {
  uploading.value = true
  try {
    const data = await uploadFileApi(options.file)
    form.image = data.url
    options.onSuccess?.()
  } catch (error) {
    options.onError?.(error)
    errorMessage(error)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.ad-upload {
  display: grid;
  gap: 10px;
}

.ad-upload__preview {
  width: 220px;
  height: 120px;
  border-radius: 8px;
  border: 1px solid #e4ebe7;
  object-fit: cover;
}

.text-sm {
  font-size: 14px;
  color: #666;
}
</style>
