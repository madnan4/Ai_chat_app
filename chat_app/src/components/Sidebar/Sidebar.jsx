import React, { useState, useEffect} from 'react';
import axios from 'axios';

import styles from "./Sidebar.module.css";

export const Sidebar = ({ onNewChat, onSelectChat }) => {

  const [chatIds, setChatIds] = useState([]);

  const API = "http://localhost:3600";

  const fetchChatIds = () => {
    axios.get(`${API}/api/chatIds`)
      .then(res => setChatIds(res.data))
      .catch(err => console.error("Failed to load chat list", err));
  };

  useEffect(() => {
    fetchChatIds();

    const interval = setInterval(() => {
      fetchChatIds(); 
    }, 5000);

    return () => clearInterval(interval); 
  }, []);

  return (
    
    <section className={styles.sidebar}>
      <h1 className={styles.title}>Chat App</h1>
      <button className={styles.newChat} onClick={onNewChat}>
        New Chat
      </button>
      <div className={styles.lowerSide}>
      <h3>Previous Chats</h3>
        <ul className={styles.chatList}>
          {chatIds.map((id) => (
            <li
              key={id}
              onClick={() => onSelectChat(id)}
              className={styles.chatItem}
            >
              {id}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
