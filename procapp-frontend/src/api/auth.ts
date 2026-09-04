import type { User } from '@/types'
import { http } from './http'

export interface LoginPayload {
    email: string
    password: string
}

export interface LoginResult {
    token: string
    user: User
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
    return http<LoginResult>('/api/auth/login', {method: 'POST', body: payload })
}