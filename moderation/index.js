// MODERATION
const PORT = 4003;
const cors = require("cors");
const express = require("express");
const morgan = require("morgan"); // log access route
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("xxx") ? "rejected" : "approved";
    await axios.post("http://localhost:4005/events", {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }
  res.send({});
});

app.listen(PORT, () => {
  console.log("QUERY listen on port", PORT);
});
