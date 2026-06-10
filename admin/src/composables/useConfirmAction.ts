import { ElMessage, ElMessageBox } from 'element-plus'

export async function confirmAction(message: string, title = '操作确认') {
  await ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    closeOnClickModal: false
  })
}

export function successMessage(message = '操作成功') {
  ElMessage.success(message)
}

export function errorMessage(error: unknown) {
  ElMessage.error(error instanceof Error ? error.message : '操作失败')
}
