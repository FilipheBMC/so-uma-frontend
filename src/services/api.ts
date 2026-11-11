// import axios from 'axios'

// export const AUTH_TOKEN_KEY = 'souma_access_token'

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// // Interceptor para adicionar o JWT automaticamente.
// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem(AUTH_TOKEN_KEY)

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config
// })

import axios from 'axios'

export const AUTH_TOKEN_KEY = 'souma_access_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Interceptor para adicionar o JWT automaticamente.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})