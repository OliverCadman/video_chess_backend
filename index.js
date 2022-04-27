const express = require("express");

const http = require("http");
const socketio = require("socket.io");

/*
  Instantiate Express, HttpServer, and SocketIO.

  Once SocketIO is connected, register SocketIO event listeners
  in initializeGame() function.
*/
const app = express();

const server = http.createServer(app);


const io = socketio(server, {
  cors: {
    origin:
      "*",
  },
});
const gameLogic = require("./logic")

io.on("connection", client => {
    console.log("Connected");
    gameLogic.initializeGame(io, client);

})

server.listen(process.env.PORT || 3000)