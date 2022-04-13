// EVENT-BUS
const PORT = 4005;
const cors = require("cors");
const { randomBytes } = require("crypto");
const express = require("express");
const morgan = require("morgan"); // log access route
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);

  // Posts Service
  axios
    .post("http://posts-clusterip-srv:4000/events", event)
    .catch((err) => console.log("4000: ", err.code));

  // Comments Service
  axios
    .post("http://comments-srv:4001/events", event)
    .catch((err) => console.log("4001: ", err.code));

  // Query Service
  axios
    .post("http://query-srv:4002/events", event)
    .catch((err) => console.log("4002: ", err.code));

  // Moderation Service
  axios
    .post("http://moderation-srv:4003/events", event)
    .catch((err) => console.log("4003: ", err.code));

  res.send({ status: "OK!" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(PORT, () => {
  console.log("EVENT-BUS listen on port", PORT);
});
