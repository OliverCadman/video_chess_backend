const express = require("express");

const http = require("http");
const socketio = require("socket.io");
const app = express();

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:8000"
    }
});
const gameLogic = require("./logic")

io.on("connection", client => {
    console.log("Connected");
    gameLogic.initializeGame(io, client);

})

server.listen(process.env.PORT || 3000)