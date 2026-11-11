import { api } from '@/services/api'

import type {
    LoginInput,
    LoginResponse,
    RegisterInput,
    User,
} from '../types/auth.types'

export const authService = {
    async login(data: LoginInput): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>(
            '/auth/login',
            data,
        )


        return response.data
    },

    async getMe(): Promise<User> {
        const response = await api.get<{ user: User }>('/auth/me')

        return response.data.user
    },
    async register(data: RegisterInput): Promise<User> {
        const response = await api.post<User>('/users', data)

        return response.data
    },
}