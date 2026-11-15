import { api } from '@/services/api'

import type {
  ManualStudySelectionPayload,
} from './questAPI-lab.types';

import type {
  QuestApiLabResponse,
  QuestApiLabPaginationParams,
  QuestApiLabTopicsParams,
} from './questAPI-lab.types';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')

async function request<T>(
  endpoint: string,
  params: URLSearchParams,
): Promise<T> {
  const url = `${API_BASE_URL}/quest-api-lab/${endpoint}?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Não foi possível consultar a Quest API.'

    throw new Error(message)
  }

  return body as T
}

export async function getLabSubjects(
  query: QuestApiLabPaginationParams,
): Promise<QuestApiLabResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    per_page: String(query.per_page),
  })

  return request<QuestApiLabResponse>('subjects', params)
}

export async function getLabTopics(
  query: QuestApiLabTopicsParams,
): Promise<QuestApiLabResponse> {
  const params = new URLSearchParams({
    materia: query.materia,
    page: String(query.page),
    per_page: String(query.per_page),
  })

  return request<QuestApiLabResponse>('topics', params)
}

export async function sendManualStudySelection(
  payload: ManualStudySelectionPayload,
): Promise<void> {
  await api.post(
    '/quest-api-lab/selection',
    payload,
  )
}