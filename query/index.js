// QUERY
const PORT = 4002;
const cors = require("cors");
const express = require("express");
const morgan = require("morgan"); // log access route
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/*
  'id-post1': {
    id,
    title,
    comments: [{id, content, status}, {id2, content2, status}]
  }
*/
const posts = {};

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    posts[postId].comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(PORT, async () => {
  console.log("QUERY listen on port", PORT);

  try {
    const res = await axios.get("htttp://localhost:4005/events");

    for (let event of res.data) {
      console.log("Processing event: ", event.type);
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error);
  }
});
