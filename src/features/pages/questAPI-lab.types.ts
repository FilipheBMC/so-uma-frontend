export interface QuestApiLabResponse {
  items: string[]
  page: number
  perPage: number
  hasMore: boolean
  total?: number
}

export interface QuestApiLabPaginationParams {
  page: number
  per_page: number
}

export interface QuestApiLabTopicsParams
  extends QuestApiLabPaginationParams {
  materia: string
}
