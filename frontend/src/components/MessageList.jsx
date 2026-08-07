import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import './MessageList.css'

/**
 * messages 배열을 순서대로 렌더링하고, 새 메시지가 오면 맨 아래로 스크롤합니다.
 * @param {{ messages: { role: string, text: string, elapsedTime?: number }[] }} props
 */
export default function MessageList({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <MessageBubble key={index} {...msg} />
      ))}
      {isLoading && <MessageBubble role="loading" />}
      <div ref={bottomRef} />
    </div>
  )
}