import express from "express";

const http = require("http");
const socketio = require("socket-io");
const app = express();

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", client => {
    console.log("Connected", client);
})
