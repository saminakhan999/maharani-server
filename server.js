const express = require("express");
const cors = require("cors");

const server = express();
server.use(cors());
server.use(express.json());

const highscoresRoutes = require("./routes/highscores");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
server.use("/highscores", highscoresRoutes);
server.use("/auth", authRoutes);
server.use("/users", userRoutes);

server.get("/", (req, res) => res.send("Hello world"));

module.exports = server;
