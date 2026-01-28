<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '../services/userService'
import UserForm from './UserForm.vue'

const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const showForm = ref(false)
const editingUser = ref(null)
const showDeleteConfirm = ref(false)
const deletingUserId = ref(null)

// 사용자 목록 조회
async function fetchUsers() {
  isLoading.value = true
  error.value = null
  try {
    users.value = await userService.getAllUsers()
  } catch (err) {
    error.value = err.message || '사용자 목록을 불러오는데 실패했습니다.'
    console.error('사용자 목록 조회 오류:', err)
  } finally {
    isLoading.value = false
  }
}

// 새 사용자 추가
function handleAddUser() {
  editingUser.value = null
  showForm.value = true
}

// 사용자 수정
function handleEditUser(user) {
  editingUser.value = { ...user }
  showForm.value = true
}

// 사용자 삭제 확인
function handleDeleteClick(userId) {
  deletingUserId.value = userId
  showDeleteConfirm.value = true
}

// 사용자 삭제 실행
async function confirmDelete() {
  if (!deletingUserId.value) return

  isLoading.value = true
  error.value = null
  try {
    await userService.deleteUser(deletingUserId.value)
    await fetchUsers()
    showDeleteConfirm.value = false
    deletingUserId.value = null
  } catch (err) {
    error.value = err.message || '사용자 삭제에 실패했습니다.'
    console.error('사용자 삭제 오류:', err)
  } finally {
    isLoading.value = false
  }
}

// 폼 닫기
function handleFormClose() {
  showForm.value = false
  editingUser.value = null
}

// 폼 저장 완료 후 목록 새로고침
function handleFormSaved() {
  fetchUsers()
  handleFormClose()
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="user-list-container">
    <div class="header">
      <h1 class="title">사용자 관리</h1>
      <button class="btn btn-primary" @click="handleAddUser">
        <span class="btn-icon">+</span>
        새 사용자 추가
      </button>
    </div>

    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <span>로딩 중...</span>
    </div>

    <div v-else-if="users.length === 0" class="empty-state">
      <p>등록된 사용자가 없습니다.</p>
      <button class="btn btn-primary" @click="handleAddUser">
        첫 사용자 추가하기
      </button>
    </div>

    <div v-else class="users-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="user-card-header">
          <h3 class="user-name">{{ user.name }}</h3>
          <div class="user-actions">
            <button
              class="btn-icon-small btn-edit"
              @click="handleEditUser(user)"
              title="수정"
            >
              ✏️
            </button>
            <button
              class="btn-icon-small btn-delete"
              @click="handleDeleteClick(user.id)"
              title="삭제"
            >
              🗑️
            </button>
          </div>
        </div>
        <div class="user-card-body">
          <div class="user-info">
            <span class="info-label">ID:</span>
            <span class="info-value">{{ user.id }}</span>
          </div>
          <div class="user-info">
            <span class="info-label">이메일:</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
          <div v-if="user.address" class="user-info">
            <span class="info-label">주소:</span>
            <span class="info-value">{{ user.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 사용자 폼 모달 -->
    <UserForm
      v-if="showForm"
      :user="editingUser"
      @close="handleFormClose"
      @saved="handleFormSaved"
    />

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal">
        <h3 class="modal-title">사용자 삭제</h3>
        <p class="modal-message">정말로 이 사용자를 삭제하시겠습니까?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">
            취소
          </button>
          <button class="btn btn-danger" @click="confirmDelete">
            삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-icon-small {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #dbeafe;
}

.btn-delete:hover {
  background-color: #fee2e2;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.alert-error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.user-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 60px;
}

.info-value {
  color: #374151;
  word-break: break-word;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.modal-message {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .user-list-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }
}
</style>
