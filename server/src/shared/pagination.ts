export function getPagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize || 20), 1), 100)
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  }
}

export function pageResult<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize }
}
