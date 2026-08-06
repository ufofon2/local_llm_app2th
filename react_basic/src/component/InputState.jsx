import { useState } from "react";
function InputState() {
    const [message, setMessage] = useState("");
    return (
        <main className="app">
            <h1>입력값 상태 관리 예제</h1>
            <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="메시지를 입력하세요"
            />
            <p><h4>입력한 메시지: {message}</h4></p>
        </main>
    );
}
export default InputState;