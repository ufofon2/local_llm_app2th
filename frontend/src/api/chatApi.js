// 백엔드(FastAPI) 주소. 이 값을 바꾸면 모든 API 호출이 새 주소를 사용한다.
const API_BASE_URL = 'http://localhost:8000'

// POST /chat 호출: 사용자 메시지와 모델 설정을 보내고 AI 응답을 받는다.
export async function sendChatMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // 백엔드가 { detail: "..." } 형태로 오류 이유를 보내주므로 그걸 우선 사용한다.
    let detail = response.statusText
    try {
      const data = await response.json()
      detail = data.detail || detail
    } catch {
      // 응답 바디가 JSON이 아니면 상태 텍스트만 사용
    }
    throw new Error(detail)
  }

  return response.json()
}

// GET /models 호출: 사이드바 모델 드롭다운에 채울 목록을 가져온다.
export async function getModels() {
  const response = await fetch(`${API_BASE_URL}/models`)

  if (!response.ok) {
    throw new Error('모델 목록을 불러오지 못했습니다.')
  }

  const data = await response.json()
  return data.models
}
