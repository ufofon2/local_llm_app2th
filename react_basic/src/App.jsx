import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
//import './App.css'
import Header   from './component/Header'
import Greeting  from './component/Greeting'

function App() {

  return (
   <>
    <h1>안녕 리액트 </h1>
    <Header></Header>
    <Greeting name="king" age ="33" />
  </>
  )}
export default App;
