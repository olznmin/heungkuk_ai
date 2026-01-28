<script setup>
import { ref, computed, watch } from 'vue'
import { userService } from '../services/userService'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const formData = ref({
  name: '',
  email: '',
  address: ''
})

const errors = ref({
  name: '',
  email: '',
  address: ''
})

const isLoading = ref(false)
const submitError = ref('')

const isEditMode = computed(() => !!props.user)

// 사용자 데이터가 변경되면 폼에 반영
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      address: newUser.address || ''
    }
  } else {
    formData.value = {
      name: '',
      email: '',
      address: ''
    }
  }
  // 에러 초기화
  errors.value = { name: '', email: '', address: '' }
  submitError.value = ''
}, { immediate: true })

// 이메일 유효성 검사
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 실시간 유효성 검사
function validateField(field, value) {
  errors.value[field] = ''

  switch (field) {
    case 'name':
      if (!value || value.trim() === '') {
        errors.value.name = '이름을 입력해주세요.'
      } else if (value.length < 2) {
        errors.value.name = '이름은 최소 2자 이상이어야 합니다.'
      } else if (value.length > 50) {
        errors.value.name = '이름은 최대 50자까지 입력 가능합니다.'
      }
      break

    case 'email':
      if (!value || value.trim() === '') {
        errors.value.email = '이메일을 입력해주세요.'
      } else if (!isValidEmail(value)) {
        errors.value.email = '유효한 이메일 형식이 아닙니다.'
      }
      break

    case 'address':
      if (value && value.length > 100) {
        errors.value.address = '주소는 최대 100자까지 입력 가능합니다.'
      }
      break
  }
}

// 전체 폼 유효성 검사
function validateForm() {
  validateField('name', formData.value.name)
  validateField('email', formData.value.email)
  validateField('address', formData.value.address)

  return !errors.value.name && !errors.value.email && !errors.value.address
}

// 폼 제출
async function handleSubmit() {
  submitError.value = ''

  if (!validateForm()) {
    submitError.value = '입력한 정보를 확인해주세요.'
    return
  }

  isLoading.value = true

  try {
    const userPayload = {
      name: formData.value.name.trim(),
      email: formData.value.email.trim(),
      address: formData.value.address.trim() || null
    }

    if (isEditMode.value) {
      await userService.updateUser(props.user.id, userPayload)
    } else {
      await userService.createUser(userPayload)
    }

    emit('saved')
  } catch (err) {
    submitError.value = err.message || '저장 중 오류가 발생했습니다.'
    console.error('사용자 저장 오류:', err)
  } finally {
    isLoading.value = false
  }
}

// 취소
function handleCancel() {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="handleCancel">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditMode ? '사용자 수정' : '새 사용자 추가' }}
        </h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="name" class="form-label">
            이름 <span class="required">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.name }"
            placeholder="이름을 입력하세요 (2-50자)"
            @blur="validateField('name', formData.name)"
            @input="validateField('name', formData.name)"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            이메일 <span class="required">*</span>
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            placeholder="이메일을 입력하세요"
            @blur="validateField('email', formData.email)"
            @input="validateField('email', formData.email)"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="address" class="form-label">주소</label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.address }"
            placeholder="주소를 입력하세요 (선택사항, 최대 100자)"
            @blur="validateField('address', formData.address)"
            @input="validateField('address', formData.address)"
          />
          <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>

        <div v-if="submitError" class="alert alert-error">
          {{ submitError }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="isLoading">
            취소
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? '저장 중...' : isEditMode ? '수정' : '추가' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #dc2626;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.input-error {
  border-color: #dc2626;
}

.form-input.input-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.alert {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

@media (max-width: 640px) {
  .modal {
    max-width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
