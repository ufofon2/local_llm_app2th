import './ChatHeader.css'

// 제목/부제목 + "대화 초기화" 버튼.
export default function ChatHeader({ onReset }) {
  return (
    <header className="chat-header">
      <div>
        <h1 className="chat-header-title">Local LLM Chat</h1>
        <p className="chat-header-subtitle">
          React + FastAPI + Ollama 기반 로컬 AI 채팅 앱
        </p>
      </div>

      <button type="button" className="chat-header-reset" onClick={onReset}>
        대화 초기화
      </button>
    </header>
  )
}
