import { useState } from 'react'
import SettingsPanel from './SettingsPanel'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { sendChatMessage } from '../api/chatApi'
import './ChatWindow.css'

// 모델 설정의 기본값. 백엔드 스키마의 기본값과 와이어프레임을 참고했다.
const DEFAULT_SETTINGS = {
  model: 'qwen2:7b-instruct-q6_K',
  promptMode: 'basic',
  systemPrompt: 'You are a helpful AI assistant. Please answer the user\'s questions kindly.',
  temperature: 0.7,
  topP: 0.9,
  numPredict: 512,
}

// 이 앱의 유일한 상태 소유자. 대화 목록/설정/로딩/에러를 모두 여기서 관리한다.
export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSettingsChange = (partialSettings) => {
    setSettings((prev) => ({ ...prev, ...partialSettings }))
  }

  const handleReset = () => {
    setMessages([])
    setError(null)
  }

  const handleSend = async (userMessage) => {
    // 1) 사용자 메시지를 먼저 화면에 추가
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)
    setError(null)

    try {
      // 2) 프론트 상태(camelCase)를 백엔드 필드명(snake_case)으로 변환해 전송
      const data = await sendChatMessage({
        message: userMessage,
        model: settings.model,
        system_prompt: settings.systemPrompt,
        temperature: settings.temperature,
        top_p: settings.topP,
        num_predict: settings.numPredict,
      })

      // 3) 응답 구조: { model, message, elapsed_time }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.message, elapsedTime: data.elapsed_time },
      ])
    } catch (err) {
      // chatApi.js가 fetch 응답 실패 시 detail 메시지를 담아 Error를 던지므로
      // err.message를 그대로 쓰면 된다 (네트워크 자체 실패면 기본 문구로 대체).
      setError(err.message || '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <SettingsPanel settings={settings} onChange={handleSettingsChange} />

      <div className="main-column">
        <div className="main-column-inner">
          <ChatHeader onReset={handleReset} />

          <section className="chat-panel">
            {messages.length === 0 && !loading && (
              <p className="chat-panel-subtitle">
                좌측 패널에서 모델 설정을 변경하고 대화를 시작해 보세요.
              </p>
            )}
            <MessageList messages={messages} isLoading={loading} />

            {error && <div className="error-banner">{error}</div>}
            <ChatInput onSend={handleSend} isLoading={loading} />
          </section>
        </div>
      </div>
    </div>
  )
}
