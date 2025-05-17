const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const chatsDir = path.join(__dirname, "../chats");

// POST: Send message, append to session file
router.post("/chat", async (req, res) => {
  const { newUserMessage, chatId } = req.body;
  const trimmedChatId = chatId?.replace(/^chat-/, "");

  if (!chatId || !newUserMessage) {
    return res.status(400).json({ error: "chatId and newUserMessage are required" });
  }

  const chatFilePath = path.join(chatsDir, `chat-${trimmedChatId}.json`);

  let existingHistory = [];
  if (fs.existsSync(chatFilePath)) {
    const data = fs.readFileSync(chatFilePath, "utf-8");
    existingHistory = JSON.parse(data);
  }

  const messageHistory = [
    ...existingHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    })),
    { role: "user", content: newUserMessage.text }
  ];

  try {
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

    const newEntries = [
      newUserMessage,
      { sender: "assistant", text: assistantReply },
    ];

    const updatedHistory = [...existingHistory, ...newEntries];

    fs.mkdirSync(chatsDir, { recursive: true });
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

// GET: Get all chat IDs sorted by last activity
router.get("/chatIds", (req, res) => {
  fs.readdir(chatsDir, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read chat files" });
    }

    const chatFiles = files.filter((file) => file.endsWith(".json"));

    const chatsWithTimestamps = chatFiles.map((file) => {
      const fullPath = path.join(chatsDir, file);
      const content = fs.readFileSync(fullPath, "utf8");
      const messages = JSON.parse(content);

      let lastActivity = 0;
      if (messages.length > 0 && messages[messages.length - 1].timestamp) {
        lastActivity = new Date(messages[messages.length - 1].timestamp).getTime();
      } else {
        const stats = fs.statSync(fullPath);
        lastActivity = stats.mtimeMs;
      }

      return {
        chatId: path.basename(file, ".json"),
        lastActivity,
      };
    });

    chatsWithTimestamps.sort((a, b) => b.lastActivity - a.lastActivity);

    const sortedChatIds = chatsWithTimestamps.map((chat) => chat.chatId);
    res.json(sortedChatIds);
  });
});


module.exports = router;
