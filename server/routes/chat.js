const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const chatsDir = path.join(__dirname, "../chats");

// POST: Send message, append to session file
router.post("/chat", async (req, res) => {
  const { messages, chatId } = req.body;
  const trimmedChatId = chatId?.replace(/^chat-/, '');
  console.log("Chat ID:", trimmedChatId);

  if (!chatId) {
    return res.status(400).json({ error: "chatId is required" });
  }

  const messageHistory = messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text,
  }));

  try {
    // Call OpenAI API
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messageHistory,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
        },
      }
    );

    const assistantReply = openaiRes.data.choices[0].message.content.trim();

    const newMessages = [
      ...messages,
      { sender: "assistant", text: assistantReply },
    ];

    // Build path for this session
    const chatFilePath = path.join(chatsDir, `chat-${trimmedChatId}.json`);

    // Read existing chat for session if exists
    let existingHistory = [];
    if (fs.existsSync(chatFilePath)) {
      const data = fs.readFileSync(chatFilePath, "utf-8");
      existingHistory = JSON.parse(data);
    }

    // Append new messages to existing session chat
    const updatedHistory = [...existingHistory, ...newMessages];

    // Ensure chats directory exists
    fs.mkdirSync(chatsDir, { recursive: true });
    // Save updated chat history for the session
    fs.writeFileSync(chatFilePath, JSON.stringify(updatedHistory, null, 2));

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "OpenAI API failed" });
  }
});

// GET: Get full chat history for a session by chatId
router.get("/chat/:chatId", (req, res) => {
  // console.log("Fetching chat history...");
  const chatId = req.params.chatId;
  const chatFile = path.join(__dirname, "../chats", `${chatId}.json`);

  fs.readFile(chatFile, "utf8", (err, data) => {
    // console.log(data);
    if (err) {
      console.error("Error reading chat file:", err.message);
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(JSON.parse(data));
  });
});

router.get("/chatIds", (req, res) => {
  // console.log("Fetching chat IDs...");
  const chatsDir = path.join(__dirname, "../chats");
  // console.log(chatsDir);

  fs.readdir(chatsDir, (err, files) => {
    if (err) {
      console.error(err);
      console.log("Error reading chat files:", err);
      return res.status(500).json({ error: "Failed to read chat files" });
    }

    const chatIds = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.basename(file, ".json")); // remove .json
    // console.log("Chat IDs:", chatIds);
    res.json(chatIds);
  });
});

module.exports = router;
