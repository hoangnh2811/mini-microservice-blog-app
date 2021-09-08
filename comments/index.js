// COMMENTS
const PORT = 4001;
const cors = require("cors");
const { randomBytes } = require("crypto");
const express = require("express");
const morgan = require("morgan"); // log access route
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
/*
  { 
    '123abc': [{id, content, status}, {id2, content2, status}],
    '456xyz': [{id, content, status}],
  }
*/
const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const postId = req.params.id;

  const comments = commentsByPostId[postId] || [];
  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[postId] = comments;

  // send event-bus
  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);
  const { type, data } = req.body;
  if (type === "CommentModerated") {
    const { id, postId, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.map((com) => {
      if (com.id === id) {
        com.status = status;
      }
      return com;
    });
    commentsByPostId[postId] = comment;
    console.log("commentsByPostId: ", commentsByPostId);

    // send event-bus
    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        postId,
        content,
        status,
      },
    });
  }
  res.send({});
});

app.listen(PORT, () => {
  console.log("COMMENTS listen on port", PORT);
});
