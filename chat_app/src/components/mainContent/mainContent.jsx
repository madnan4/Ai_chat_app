import React, { useState, useEffect } from "react";
import styles from "./mainContent.module.css";
import axios from "axios";

export const MainContent = ({ chatId, oldChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const API = 'http://localhost:3600';

  useEffect(() => {
    if (oldChat !=1) return;
    axios.get(`${API}/api/chat/${chatId}`)
      .then(res => setMessages(res.data))
      .catch(err => {
        console.error("Failed to load chat history", err);
        setMessages([]);
      });
  }, [chatId]);

  const sendMessageToOpenAI = async (messages) => {
    const response = await axios.post(`${API}/api/chat`, { messages, chatId });
    return response.data.reply;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addUserMessage();
    }
  };

  const addUserMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = { sender: "user", text: inputValue.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputValue("");

      try {
        const aiResponse = await sendMessageToOpenAI(updatedMessages);
        const aiMessage = { sender: "assistant", text: aiResponse };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage = { sender: "assistant", text: error.message };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  return (
    <section className={styles.mainContent}>
      <h1 className={styles.title}>Chat App</h1>
      <div className={styles.mainText}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === "assistant"
                ? styles.assistantMessage
                : styles.userMessage
            }
          >
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <textarea
          className={styles.input}
          value={inputValue}
          placeholder="Enter your message..."
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.send} onClick={addUserMessage}>Send</button>
      </div>
    </section>
  );
};
