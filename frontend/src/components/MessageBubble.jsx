import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CopyIcon, CheckIcon, LoadingIcon } from './Icons'
import './MessageBubble.css'

/**
 * 코드 블록을 렌더링하고 복사 버튼을 추가하는 컴포넌트입니다.
 */
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const codeText = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return !inline && match ? (
    <div className="code-block">
      <div className="code-header">
        <span>{match[1]}</span>
        <button onClick={handleCopy} className={`copy-button ${isCopied ? 'copied' : ''}`}>
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

/**
 * 개별 메시지 버블 컴포넌트입니다.
 * 역할(user, assistant, loading)에 따라 다른 스타일을 적용하고,
 * Markdown 렌더링 및 복사 기능을 제공합니다.
 */
export default function MessageBubble({ role, text, elapsedTime }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyMessage = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (role === 'loading') {
    return (
      <div className="bubble bubble-assistant bubble-loading">
        <LoadingIcon />
      </div>
    )
  }

  const bubbleClass = `bubble bubble-${role}`

  return (
    <div className={bubbleClass}>
      <div className="bubble-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
          {text}
        </ReactMarkdown>
      </div>

      {role === 'assistant' && (
        <div className="bubble-meta">
          <span className="elapsed-time">{elapsedTime?.toFixed(2)}s</span>
          <button onClick={handleCopyMessage} className={`copy-button ${isCopied ? 'copied' : ''}`}>
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      )}
    </div>
  )
}