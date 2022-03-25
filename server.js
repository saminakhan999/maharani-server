const express = require("express");
const cors = require("cors");

const server = express();
server.use(cors());
server.use(express.json());

const habitsRoutes = require("./routes/habits");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
server.use("/habits", habitsRoutes);
server.use("/auth", authRoutes);
server.use("/users", userRoutes);

server.get("/", (req, res) => res.send("Hello world"));

module.exports = server;
