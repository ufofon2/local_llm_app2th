import { useState } from 'react'
import { SendIcon } from './Icons'
import './ChatInput.css'

// 메시지 입력 UI. 실제 전송(fetch 등)은 부모가 onSend로 처리한다.
export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState('')

  const send = () => {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return

    onSend(trimmed)
    setMessage('')
  }

  const handleKeyDown = (e) => {
    // Shift+Enter는 줄바꿈, Enter만 눌렀을 때 전송
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-input">
      <textarea
        className="chat-input-textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows="2"
        placeholder="질문을 입력하세요. 예: FastAPI와 React를 연결하는 이유를 설명해줘. (Shift+Enter: 줄바꿈)"
        disabled={isLoading}
      />

      <button
        type="button"
        className="chat-input-send"
        onClick={send}
        disabled={isLoading || !message.trim()}
        aria-label={isLoading ? '응답 생성 중' : '전송'}
      >
        <SendIcon />
      </button>
    </div>
  )
}
