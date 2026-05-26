import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const abTestApi = {
  getAll:       () => api.get('/abtests'),
  create:       (data) => api.post('/abtests', data),
  pause:        (id) => api.put(`/abtests/${id}/pause`),
  resume:       (id) => api.put(`/abtests/${id}/resume`),
  delete:       (id) => api.delete(`/abtests/${id}`),
  simulate:     (id) => api.post(`/abtests/${id}/simulate`),
  applyWinner:  (id) => api.post(`/abtests/${id}/apply-winner`),
  getInsight:   (id) => api.post(`/abtests/${id}/insight`),
}

export const suggestionApi = {
  getAll: () => api.get('/suggestions'),
  apply:  (id) => api.post(`/suggestions/${id}/apply`), // BUG 8 FIX: was api.put
}

export const chatApi = {
  getHistory: () => api.get('/chat'),
  send: (message) => api.post('/chat', { message }),
}

export const productApi = {
  getAll: () => api.get('/products'),
}

export const analyticsApi = {
  get: () => api.get('/analytics'),
}

export default api