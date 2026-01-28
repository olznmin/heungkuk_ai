import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 에러 처리 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.'
    return Promise.reject({ ...error, message })
  }
)

export const userService = {
  // 모든 사용자 조회
  async getAllUsers() {
    const response = await apiClient.get('/api/users')
    return response.data
  },

  // 특정 사용자 조회
  async getUserById(id) {
    const response = await apiClient.get(`/api/users/${id}`)
    return response.data
  },

  // 사용자 생성
  async createUser(userData) {
    const response = await apiClient.post('/api/users', userData)
    return response.data
  },

  // 사용자 수정
  async updateUser(id, userData) {
    const response = await apiClient.put(`/api/users/${id}`, userData)
    return response.data
  },

  // 사용자 삭제
  async deleteUser(id) {
    const response = await apiClient.delete(`/api/users/${id}`)
    return response.data
  }
}
