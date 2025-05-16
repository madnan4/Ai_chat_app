const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chat");

dotenv.config();

const app = express();
const PORT = 3600;

app.use(cors());
app.use(express.json());
app.use("/api", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
