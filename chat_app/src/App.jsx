import { useState } from 'react'
// import './App.css'
import styles from './App.module.css'
import {Sidebar} from './components/Sidebar/sidebar'
import {MainContent} from './components/mainContent/mainContent'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';


function App() {
  const [chatId, setChatId] = useState(uuidv4());
  const [oldChat, setOldChat] = useState([]);

  const startNewChat = () => {
    setChatId(uuidv4());
    // setOldChat([]);
    setOldChat(0);
  };
  const handleSelectChat = (id) => {
    setChatId(id);
    setOldChat(1);
  };

  return (
    <div className={styles.container}>
      <Sidebar onNewChat={startNewChat} onSelectChat={handleSelectChat} />
      <MainContent chatId={chatId} oldChat={oldChat} />
      </div>
  )
}

export default App
