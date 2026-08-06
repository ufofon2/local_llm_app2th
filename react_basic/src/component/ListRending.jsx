function ListRending() { 
  const messages = [ 
    { id: 1, role: "user", content: "안녕하세요." }, 
    { id: 2, role: "assistant", content: "무엇을 도와드릴까요?" }, 
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
  ); 
} 
 
export default ListRending; 