import { useState } from "react"; 
import axios from "axios"; 
const CHAT_URL = "http://localhost:8000/chat"; 

function Ollama_chat() { 
// 입력값, 응답 결과, 로딩 상태, 오류 메시지를 상태로 관리한다. 
const [message, setMessage] = useState(""); 
const [answer, setAnswer] = useState(null); 
const [isLoading, setIsLoading] = useState(false); 
const [errorMessage, setErrorMessage] = useState(""); 
const handleSend = async () => { 
if (!message.trim()) { 
alert("메시지를 입력하세요."); 
return; 
} 
// 요청 전 상태 초기화 
setIsLoading(true); 
setErrorMessage(""); 
setAnswer(null); 
try { 
// FastAPI 백엔드의 /chat API로 사용자 메시지를 전송한다. 
const response = await axios.post(CHAT_URL, { 
message: message, 
model: "llama3.2:3b", 
system_prompt: "너는 초보자를 돕는 AI 강사다.", 
temperature: 0.5, 
top_p: 0.9, 
num_predict: 256, 
}); 
// 응답 전체 객체를 상태에 저장한다. 
const data = response.data; 
console.log(data); 
setAnswer(data); 
} catch (error) { 
console.error(error); 
setErrorMessage("서버 요청 중 오류가 발생했습니다."); 
} finally { 
setIsLoading(false); 
} 
};
  return ( 
    <main className="app"> 
      <h1>Ollama Chat</h1> 
 
      <section> 
        <textarea 
          value={message} 
          onChange={(event) => setMessage(event.target.value)} 
          placeholder="메시지를 입력하세요." 
          rows={5} 
        /> 
 
        <br /> 
 
        <button onClick={handleSend} disabled={isLoading}> 
          {isLoading ? "응답 생성 중..." : "전송"} 
        </button> 
      </section> 
 
      <section> 
        <h2>응답</h2> 
 
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} 
 
        {/* 로딩 중이면 안내 문구를 보여주고, 응답이 있으면 결과를 출력한다. */} 
        {isLoading ? ( 
          <p>Ollama가 응답을 생성하고 있습니다.</p> 
        ) : ( 
          answer && ( 
            <> 
              <p>{answer.model}</p> 
              <p>{answer.message}</p> 
              <p>{answer.elapsed_time}</p> 
            </> 
          ) 
        )} 
      </section> 
    </main> 
  ); 
} 
 
export default Ollama_chat; 