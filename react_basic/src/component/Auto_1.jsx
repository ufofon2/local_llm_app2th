import { useState, useEffect, useRef } from 'react'
import ChatInput from './ChatInput'

// 로컬 LLM(FastAPI 백엔드)과 대화하는 채팅 컴포넌트
export default function Auto_1() {
  // 지금까지 주고받은 대화 목록 (사용자 메시지 + AI 응답)
  const [chatLog, setChatLog] = useState([])
  // API 응답을 기다리는 중인지 여부 (버튼 비활성화 등에 사용)
  const [loading, setLoading] = useState(false)
  // API 호출 중 발생한 오류 메시지
  const [error, setError] = useState(null)

  // 채팅 로그의 맨 아래를 가리키는 ref (자동 스크롤용)
  const bottomRef = useRef(null)

  // chatLog가 바뀔 때마다(새 메시지가 추가될 때마다) 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog])

  // ChatInput이 전송 버튼/Enter를 눌렀을 때 호출하는 함수
  const handleSend = async (userMessage) => {
    // 1) 사용자 메시지를 먼저 화면에 추가
    setChatLog((prev) => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)
    setError(null)

    try {
      // 2) FastAPI 백엔드로 POST 요청 (요구된 요청 구조 그대로)
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          model: 'llama3.2:3b',
          system_prompt: '너는 초보자를 돕는 AI 강사다.',
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 256
        })
      })

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`)
      }

      // 3) 응답 구조: { model, message, elapsed_time }
      const data = await response.json()

      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.message,
          elapsedTime: data.elapsed_time
        }
      ])
    } catch (err) {
      // 네트워크 오류, 서버 오류 등을 사용자에게 보여줌
      setError(err.message || '응답을 가져오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h2>로컬 LLM 채팅</h2>

      <div style={{ marginBottom: 16 }}>
        {chatLog.map((entry, index) => (
          <div
            key={index}
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: entry.role === 'user' ? '#e8f0fe' : '#f5f5f5'
            }}
          >
            <strong>{entry.role === 'user' ? '나' : 'AI'}:</strong>
            <p style={{ margin: '8px 0 0' }}>{entry.text}</p>
            {entry.elapsedTime != null && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
                응답 시간: {entry.elapsedTime}s
              </p>
            )}
          </div>
        ))}
        {/* 자동 스크롤을 위한 빈 요소 */}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} isLoading={loading} />

      {error && (
        <div style={{ marginTop: 12, color: '#b91c1c' }}>
          오류: {error}
        </div>
      )}
    </div>
  )
}
