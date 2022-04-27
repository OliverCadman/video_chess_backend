var io;
var gameSocket;
var gamesInSession = [];

const initGame = (sio, socket) => {
    /* Register SocketIO Event Listeners
       for game logic and video chat.
    */
    io = sio;
    gameSocket = socket;

    gamesInSession.push(gameSocket);
    gameSocket.on("disconnect", onDisconnect);
    gameSocket.on("new move", newMove);
    gameSocket.on("createNewGame", createNewGame);

    gameSocket.on("playerJoinGame", playerJoinGame);
    gameSocket.on("request username", requestUserName);
    gameSocket.on("received username", receivedUserName);
    gameSocket.on("startNewGame", startNewGame);

    chatLogic();
}

function chatLogic () {
    /* Register event listeners for video chat. */
    gameSocket.on("callUser", data => {
        io.to(data.userToCall).emit("video connected", {signal: data.signalData, from: data.from})
    })

    gameSocket.on("acceptCall", data => {
        io.to(data.to).emit("callAccepted", data.signal)
    })
}

function playerJoinGame (idData) {
    /*  
        The game's ID is used to identify the rooms.

        If two identical game IDs are present in one
        room, this means that two players have joined a room,
        and a game is started.

        If a third player attempts to join a room, the status
        is updated to inform that the room is already full.
    */
    var sock = this;

    // 
    const rooms = Array.from(io.sockets.adapter.rooms);
    const room = rooms.map((room) => {
        if (room.includes(idData.gameId)) {
            return room
        }
    })

    if (room === undefined) {
        this.emit("status", "This game does not exist");
        return;
    }


    if (room.length < 3) {
        idData.mySocketId = sock.id;
        sock.join(idData.gameId);

        if (room.length === 3) {
            io.sockets.in(idData.gameId).emit("start game", idData.userName);
        }

        io.sockets.in(idData.gameId).emit("playerJoinedRoom", idData);
    } else {
        this.emit("status", "There are already 2 people playing in this room.")
    }
}

function createNewGame(gameId) {
  /**
     *  Create a SocketIO room upon a player
        submitting their username and joining a game.
     */

  this.emit("createNewGame", { gameId: gameId, mySocketId: this.id });
  this.join(gameId);
}

function newMove(move) {
    /** Update SocketIO room with new chess move. */
    const gameId = move.gameId;
    io.to(gameId).emit("opponent move", move);
}

function onDisconnect() {
    /** Remove game from array of games in session if a user disconnects. */
    let i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);

}

function requestUserName(gameId) {
    /** Request a second player's username when they join the game. */
    io.to(gameId).emit("give userName", this.id);
}

function receivedUserName(data) {
    data.socketId = this.id;
    io.to(data.gameId).emit("get Opponent UserName", data);
}

function startNewGame(data) {
    /** Emit a 'restartGame' event if a user
     * chooses to start new game after checkmate.
     */
    io.to(data.gameId).emit("restartGame");
}

exports.initializeGame = initGame;