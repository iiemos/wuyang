/* 清理联调过程中产生的测试数据：node prisma/cleanup-test-data.js */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SEED_WORDS = ['代开发票', '赌博', '高利贷', '刷单', '彩票代购']

async function main() {
  // 接口联调时通过 curl 写入的测试信息（按测试专用手机号识别）
  const testListings = await prisma.listing.findMany({
    where: { OR: [{ phone: { in: ['13912345678', '13900000000', '13599998888'] } }, { title: { startsWith: '闭环测试-' } }] }
  })
  for (const listing of testListings) {
    await prisma.listing.delete({ where: { id: listing.id } })
    console.log('删除测试信息:', listing.id)
  }

  const reports = await prisma.report.findMany()
  for (const report of reports) {
    if (report.reason.includes('�') || report.targetTitle.includes('�') || report.targetTitle.startsWith('闭环测试-')) {
      await prisma.report.delete({ where: { id: report.id } })
      console.log('删除测试举报:', report.id)
    }
  }

  const words = await prisma.sensitiveWord.findMany()
  for (const word of words) {
    if (!SEED_WORDS.includes(word.word)) {
      await prisma.sensitiveWord.delete({ where: { id: word.id } })
      console.log('删除测试敏感词:', word.word)
    }
  }

  const messages = await prisma.message.findMany()
  for (const message of messages) {
    if (message.desc.includes('�') || message.desc.includes('闭环测试-')) {
      await prisma.message.delete({ where: { id: message.id } })
      console.log('删除测试消息:', message.id)
    }
  }

  const logs = await prisma.operationLog.findMany()
  for (const log of logs) {
    if (log.target.includes('�') || log.target.includes('闭环测试-')) {
      await prisma.operationLog.delete({ where: { id: log.id } })
      console.log('删除测试日志:', log.id)
    }
  }

  console.log('清理完成')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
