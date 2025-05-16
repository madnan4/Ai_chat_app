import axios from "axios";

export const sendMessageToOpenAI = async (messages) => {
  const response = await axios.post("http://localhost:3600/api/chat", { messages });
  return response.data.reply;
};
