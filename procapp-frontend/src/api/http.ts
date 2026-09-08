import { ApiError } from "./apiError"

const BASE_URL = 'http://localhost:8080'

// Simple in-memory holder, updated by AuthContext on login/logout. Avoids
// prop-drilling the token through every API call, and avoids relying on
// localStorage, which AuthContext doesn't actually use.
let currentToken: string | null = null

export function setAuthToken(token: string | null) {
  currentToken = token
}

function getToken(): string | null {
  return currentToken
}

type QueryValue = string | number | boolean | undefined | null | (string | number) []

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, QueryValue>

}

function buildQueryString(params?: RequestOptions['params']): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)))
    } else {
      search.append(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/** Shared fetch wrapper: attaches the bearer token, builds query strings,
 * and normalizes error responses into the same ApiError shape the mock
 * already throws — so feature code catching ApiError doesn't change at all. */
export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}${buildQueryString(options.params)}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message ?? 'Request failed', res.status, data?.fieldErrors)
  }

  return data as T
}

/** Multipart variant for file uploads (invoice attachments) — no
 * Content-Type header, since the browser needs to set its own boundary. */
export async function httpUpload<T>(path: string, file: File): Promise<T> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message ?? 'Upload failed', res.status, data?.fieldErrors)
  }

  return data as T
}

/** Binary GET for authenticated downloads (invoice attachments). The endpoint
 * requires the bearer token, so a plain <a href> can't reach it — callers fetch
 * the blob here and open it via URL.createObjectURL. */
export async function httpDownload(path: string): Promise<Blob> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(data?.message ?? 'Download failed', res.status, data?.fieldErrors)
  }

  return res.blob()
}