<script setup>
import { computed, ref } from 'vue'

// ===== 약관 오류 분석 목록 더미 데이터 =====
const termsList = ref([
  {
    id: 'TAE-001',
    fileName: '무배당 건강보험 보통약관 개정안_v1.hwpx',
    logicAnalyzedCount: 12,
    isAIAnalyzed: true,
    creator: '홍길동',
    createdAt: '2026-01-20T10:12:00Z'
  },
  {
    id: 'TAE-002',
    fileName: '무배당 암보험 특별약관_v3.hwpx',
    logicAnalyzedCount: 5,
    isAIAnalyzed: false,
    creator: '이영희',
    createdAt: '2026-01-22T09:05:00Z'
  },
  {
    id: 'TAE-003',
    fileName: '어린이 보험 약관_v7.hwpx',
    logicAnalyzedCount: 0,
    isAIAnalyzed: false,
    creator: '관리자',
    createdAt: '2026-01-25T13:30:00Z'
  }
])

const pageSize = ref(10)
const totalCount = computed(() => termsList.value.length)

const selectedTermId = ref(termsList.value[0]?.id ?? null)
const selectedTerm = computed(() =>
  termsList.value.find((t) => t.id === selectedTermId.value) ?? null
)

function selectTerm(term) {
  selectedTermId.value = term.id
}

// ===== 상세 페이지용 두뎁스 JSON 더미 데이터 =====
const errorGroups = ref([
  {
    type: 'COMPLIANCE',
    label: 'COMPLIANCE',
    description: '보험업법 및 감독규정 등 규제 준수 관련 오류',
    items: [
      {
        id: 'ERR-C-001',
        title: '제3조: 보험금 지급기한',
        description: '“영업일 기준 3일” 문구가 규제 가이드와 상이함',
        highlightText: '영업일 기준 3일',
        suggestion: '“접수 후 지체 없이” 로 변경 권고',
        category: 'refer',
        location: {
          article: '제3조(보험금의 지급사유)',
          paragraph: 1
        }
      }
    ]
  },
  {
    type: 'CONSUMER_PROTECTION',
    label: 'CONSUMER PROTECTION',
    description: '소비자 이해 및 설명 의무 관련 오류',
    items: [
      {
        id: 'ERR-P-001',
        title: '제15조: 중요내용 설명의무',
        description: '약관의 주요 내용 설명 의무 표현이 모호함',
        highlightText: '약관의 주요 내용을 설명하여야 합니다.',
        suggestion: '설명의 주체와 범위를 보다 명확하게 표현',
        category: 'form',
        location: {
          article: '제15조(회사의 설명의무)',
          paragraph: 1
        }
      }
    ]
  },
  {
    type: 'LEGAL_UPDATE',
    label: 'LEGAL UPDATE',
    description: '법령/표준약관 개정에 따른 업데이트 필요 사항',
    items: [
      {
        id: 'ERR-L-001',
        title: '제18조: 계약 전 알릴 의무',
        description:
          '최근 5년 이내 수술 여부 확인 문구가 최신 표준약관과 불일치',
        highlightText: '최근 5년 이내 수술 여부',
        suggestion: '표준약관 “7년 이내 병력 여부” 문구로 변경 검토',
        category: 'etc',
        location: {
          article: '제18조(계약 전 알릴 의무)',
          paragraph: 2
        }
      }
    ]
  }
])

const selectedGroupType = ref(errorGroups.value[0]?.type ?? null)
const selectedErrorId = ref(errorGroups.value[0]?.items[0]?.id ?? null)

const selectedGroup = computed(() =>
  errorGroups.value.find((g) => g.type === selectedGroupType.value) ?? null
)

const selectedError = computed(() => {
  if (!selectedGroup.value) return null
  return (
    selectedGroup.value.items.find((item) => item.id === selectedErrorId.value) ??
    null
  )
})

function selectError(groupType, errorId) {
  selectedGroupType.value = groupType
  selectedErrorId.value = errorId
}

const formattedSelectedErrorJson = computed(() =>
  selectedError.value ? JSON.stringify(selectedError.value, null, 2) : ''
)
</script>

<template>
  <div class="page">
    <!-- 약관 오류 분석 목록 영역 (목록 페이지 껍데기) -->
    <section class="section">
      <header class="section-header">
        <div>
          <h1 class="section-title">약관 오류 분석 목록</h1>
          <p class="section-subtitle">
            약관 파일 업로드 및 AI 분석 결과 목록을 확인합니다. (더미 데이터)
          </p>
        </div>

        <div class="section-actions">
          <button type="button" class="btn secondary">파일 업로드 (mock)</button>
          <button type="button" class="btn primary">AI 분석 시작 (mock)</button>
        </div>
      </header>

      <div class="card">
        <div class="card-header">
          <div>총 {{ totalCount }}건</div>
          <div class="pagination-info">페이지 크기: {{ pageSize }}</div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>파일 이름</th>
              <th>논리 분석 완료</th>
              <th>AI 분석 여부</th>
              <th>생성자</th>
              <th>생성일시</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="term in termsList"
              :key="term.id"
              :class="{ 'is-active': term.id === selectedTermId }"
              @click="selectTerm(term)"
            >
              <td>{{ term.id }}</td>
              <td class="file-name-cell">
                {{ term.fileName }}
              </td>
              <td>{{ term.logicAnalyzedCount }}</td>
              <td>
                <span
                  class="badge"
                  :class="term.isAIAnalyzed ? 'badge-success' : 'badge-muted'"
                >
                  {{ term.isAIAnalyzed ? '완료' : '대기' }}
                </span>
              </td>
              <td>{{ term.creator }}</td>
              <td>{{ new Date(term.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 약관 오류 분석 상세 영역 (상세 페이지 껍데기) -->
    <section class="section">
      <header class="section-header">
        <div>
          <h2 class="section-title">약관 오류 분석 상세</h2>
          <p class="section-subtitle">
            좌측 오류 피드(두뎁스 JSON)에서 항목을 선택하면 우측에 상세 JSON이
            출력됩니다.
          </p>
        </div>

        <div v-if="selectedTerm" class="selected-term-info">
          <div class="selected-term-label">선택된 약관</div>
          <div class="selected-term-name">
            {{ selectedTerm.fileName }}
          </div>
        </div>
      </header>

      <div class="detail-layout card">
        <!-- 좌측: Error Feed (두뎁스 JSON 구조 표현) -->
        <aside class="error-feed">
          <h3 class="error-feed-title">Error Feed</h3>

          <div class="error-feed-groups">
            <div
              v-for="group in errorGroups"
              :key="group.type"
              class="error-group"
            >
              <div class="error-group-header">
                <div class="error-group-title">{{ group.label }}</div>
                <div class="error-group-count">
                  {{ group.items.length }}건
                </div>
              </div>
              <div class="error-group-description">
                {{ group.description }}
              </div>

              <ul class="error-items">
                <li
                  v-for="item in group.items"
                  :key="item.id"
                  :class="[
                    'error-item',
                    {
                      'is-selected':
                        selectedGroupType === group.type &&
                        selectedErrorId === item.id
                    }
                  ]"
                  @click="selectError(group.type, item.id)"
                >
                  <div class="error-item-title">
                    {{ item.title }}
                  </div>
                  <div class="error-item-meta">
                    <span class="pill">{{ item.category }}</span>
                    <span class="meta-text">
                      {{ item.location.article }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <!-- 우측: 선택된 오류 JSON 표시 -->
        <main class="error-detail">
          <div class="error-detail-header">
            <h3 class="error-detail-title">선택된 오류 JSON</h3>
            <p class="error-detail-subtitle">
              실제 연동 시
              <code>/terms-analyzed-for-errors/{id}</code> 응답 객체를 그대로
              매핑해서 사용하면 됩니다.
            </p>
          </div>

          <div v-if="selectedError" class="json-viewer">
            <pre>{{ formattedSelectedErrorJson }}</pre>
          </div>
          <div v-else class="json-empty">
            좌측 Error Feed에서 오류 항목을 선택하면 JSON이 표시됩니다.
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
}

.section-subtitle {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #666;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn.primary {
  background-color: #2563eb;
  color: #fff;
}

.btn.secondary {
  background-color: #fff;
  border-color: #d4d4d4;
  color: #333;
}

.card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #555;
}

.pagination-info {
  font-size: 0.8rem;
  color: #888;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

.table th,
.table td {
  padding: 0.5rem 0.6rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.table thead th {
  background-color: #f9fafb;
  font-weight: 600;
  font-size: 0.8rem;
  color: #555;
}

.table tbody tr {
  cursor: pointer;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

.table tbody tr.is-active {
  background-color: #eff6ff;
}

.file-name-cell {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}

.badge-muted {
  background-color: #e5e7eb;
  color: #4b5563;
}

.detail-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 1rem;
}

.error-feed {
  border-right: 1px solid #e5e7eb;
  padding-right: 1rem;
}

.error-feed-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.error-feed-groups {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.error-group {
  border-radius: 6px;
  background-color: #f9fafb;
  padding: 0.6rem;
}

.error-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-group-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5563;
}

.error-group-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.error-group-description {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.error-items {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-item {
  padding: 0.4rem 0.45rem;
  border-radius: 4px;
  cursor: pointer;
}

.error-item:hover {
  background-color: #e5e7eb;
}

.error-item.is-selected {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
}

.error-item-title {
  font-size: 0.8rem;
  font-weight: 500;
}

.error-item-meta {
  margin-top: 0.1rem;
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.pill {
  font-size: 0.65rem;
  text-transform: uppercase;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background-color: #fee2e2;
  color: #b91c1c;
}

.meta-text {
  font-size: 0.7rem;
  color: #6b7280;
}

.error-detail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.error-detail-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.error-detail-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.error-detail-subtitle {
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.json-viewer {
  background-color: #0b1120;
  color: #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.78rem;
  overflow: auto;
  max-height: 360px;
}

.json-viewer pre {
  margin: 0;
}

.json-empty {
  border-radius: 6px;
  border: 1px dashed #d1d5db;
  padding: 1rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.selected-term-info {
  text-align: right;
}

.selected-term-label {
  font-size: 0.7rem;
  color: #9ca3af;
}

.selected-term-name {
  font-size: 0.8rem;
  font-weight: 500;
}

@media (max-width: 960px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .error-feed {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 0.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>