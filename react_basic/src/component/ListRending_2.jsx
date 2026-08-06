//rafce
//rfce
import React from 'react'

const messages = [
    { id: 1, role: "user", content: "안녕하세요." },
    { id: 2, role: "assistant", content: "무엇을 도와드릴까요?" },
    { id: 3, role: "user", content: "오늘 날씨는 어때요?" },
    { id: 4, role: "assistant", content: "오늘 날씨는 맑습니다. " },
];

    return (
        <main>
            <h1>메시지 목록</h1>
            {messages.map((message) => (
                <div key={message.id}>
                    <strong>{message.role}</strong>
                    <p>{message.content}</p>
                </div>
            ))}
        </main>
    )

export default ListRending_2