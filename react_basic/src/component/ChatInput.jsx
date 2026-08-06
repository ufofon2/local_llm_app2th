import { useState } from 'react'

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
    <div style={{ display: 'flex', gap: 8 }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows="2"
        placeholder="메시지를 입력하세요"
        disabled={isLoading}
        style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
      />

      <button
        type="button"
        onClick={send}
        disabled={isLoading || !message.trim()}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          background: '#4f46e5',
          color: '#fff',
          cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? '전송 중...' : '전송'}
      </button>
    </div>
  )
}
