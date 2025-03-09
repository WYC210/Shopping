// src/utils/queryBuilder.ts
interface QueryParams {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export class useQueryBuilder {
  private params: QueryParams = {}

  withPagination(page: number, size: number): this {
    this.params.page = page
    this.params.size = size
    return this
  }

  withSort(field: string, order: 'asc' | 'desc'): this {
    this.params.sortField = field
    this.params.sortOrder = order
    return this
  }

  build(): QueryParams {
    return this.params
  }
}

// 使用示例
const query = new useQueryBuilder()
  .withPagination(1, 10)
  .withSort('name', 'asc')
  .build()