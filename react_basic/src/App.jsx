import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
//import './App.css'
import Header   from './component/Header'
import Greeting  from './component/Greeting'
import InputState from './component/InputState'
import Counter from './component/Counter'
import UseEffectRender from './component/UseEffectRender'
import Ollama_chat from './component/Ollama_chat' 
import Auto_1 from './component/Auto_1' 



function App() {

  return (
   <>
    <h3><Counter /></h3>
    <h3><InputState /> </h3>   
    <h3><UseEffectRender /> </h3>  
    <p>

    </p>
    <h3>Ollama_chat</h3>
    <p></p>
    <p>
      <Auto_1 />
    </p>
    <h1>안녕 리액트 </h1>
    <Header></Header>
    <Greeting name="king" age ="33" />
  </>
  )}
export default App;
