import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import { validateSocket } from "./auth/socketAuth.js";
import { errorHandler } from "./src/middleware/GlobalErrorHandler.js";
import { user } from "./src/routes/user.route.js";

import { getSockets } from "./src/helper/getSockets.js";
import { getTicTacToeResult } from "./src/helper/getGameResult.js";
import { getDisConnUser, getIndex } from "./src/helper/helper.js";
import { getRoomMessage } from "./src/constants/roomMessage.js";
import { Result } from "./src/model/result.model.js";
import { resultRoute } from "./src/routes/result.route.js";
import { User } from "./src/model/user.model.js";
import helmet from 'helmet'
// Load env variables
dotenv.config();

import "./config/connectToDb.js";
// Create app and server
const app = express();
const server = createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Socket auth
io.use((socket, next) => validateSocket(socket, next));

// Attach IO to app
app.set("io", io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.use("/api/v1", user);
app.use("/api/v1", resultRoute);
// Global Error Handler
app.use(errorHandler);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

app.get("/",(req,res)=>{
  return res.status(200).json({success:true,message:"server runing"})
})
// State
export let activeUser = [];
export let currentPlayingUser = [];

io.on("connection", (socket) => {
  console.log(`✅ ${socket.user?.name} connected`);

  const socketUser = {
    userId: socket?.user?._id,
    name: socket.user?.name,
    avatar: socket.user?.avatar,
    socketId: socket.id,
    isPlaying: false,
    oponent: "",
  };

  activeUser.push(socketUser);
  emitUsers();

  // Handle manual request for active users
  socket.on("GET_ACTIVE_USERS", () => {
    socket.emit("ACTIVEUSERS", { activeuser: activeUser });
  });

  // Handle friend request
  socket.on("FRIEND_REQUEST", ({ name, avatar, socketId }) => {
    io.to(socketId).emit("GET_FRIEND_REQ", {
      sender: { ...socket?.user, socketId },
    });
    emitCurrentPlayers();
  });

  // Accept friend request
  socket.on("ACCEPT_FRIEND_REQUEST", ({ you, oponent }) => {
    const socket1 = getSockets(you?.name);
    const socket2 = getSockets(oponent?.name);
    if (!socket1 || !socket2) return;

    // Add to current playing users if not already present
    if (!currentPlayingUser.includes(socket1.userId))
      currentPlayingUser.push(socket1.userId);
    if (!currentPlayingUser.includes(socket2.userId))
      currentPlayingUser.push(socket2.userId);

    // Update active users
    activeUser = activeUser.map((player) => {
      if (player.name === socket1.name || player.name === socket2.name) {
        return {
          ...player,
          isPlaying: true,
          oponent: player.name === socket1.name ? socket2.name : socket1.name,
        };
      }
      return player;
    });

    emitUsers();
    emitCurrentPlayers();

    const roomMessage = getRoomMessage(socket1, socket2);
    io.to([socket1.socketId, socket2.socketId]).emit(
      "ACCEPT_FRIEND_REQUEST",
      roomMessage
    );
    io.to([socket1.socketId, socket2.socketId]).emit("IS_PLAYING", true);
  });

  // Handle player move
  socket.on("PLAYER_MOVE", async ({ player1, player2, currentTurn, board }) => {
    const socket1 = getSockets(player1?.name);
    const socket2 = getSockets(player2?.name);
    if (!socket1 || !socket2) return;

    const result = getTicTacToeResult(board);

    if (result === "Draw" || result === "X" || result === "O") {
      const idsToRemove = [socket1.userId, socket2.userId];
      currentPlayingUser = currentPlayingUser.filter(
        (id) => !idsToRemove.includes(id)
      );

      console.log("filter ", currentPlayingUser);
      if (result === "Draw") {
        io.to([socket1.socketId, socket2.socketId]).emit("MATCH_DRAW", {
          result: "DRAW",
        });
      } else {
        const winner = player1.symbol === result ? socket1 : socket2;
        const looser = player1.symbol === result ? socket2 : socket1;

        io.to([socket1.socketId, socket2.socketId]).emit("GET_WINNER", {
          winner,
          looser,
        });

        await Result.create({
          winner: winner.userId,
          looser: looser.userId,
        });
      }

      activeUser = activeUser.map((user) =>
        user.userId === socket1.userId || user.userId === socket2.userId
          ? { ...user, isPlaying: false, oponent: "" }
          : user
      );

      emitUsers();
      emitCurrentPlayers();
      io.to([socket1.socketId, socket2.socketId]).emit("IS_PLAYING", false);
    } else {
      // Continue game
      io.to([socket1.socketId, socket2.socketId]).emit("PLAYER_MOVE", {
        player1,
        player2,
        currentTurn,
        board,
      });
    }
  });

  // Handle chat message
  socket.on("SEND_MSG", (data) => {
    const senderSocket = getSockets(data?.sender);
    const receiverSocket = getSockets(data?.receiver);
    if (senderSocket && receiverSocket) {
      io.to(receiverSocket.socketId).emit("RECEIVED_MESSAGE", { data });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`❌ Disconnected: ${socket.user?.name}`);

    const you = getDisConnUser(socket?.user?.name);
    const yourIndex = getIndex(socket.user?.name);
    const opponentIndex = getIndex(you?.oponent);
    const opponent = activeUser[opponentIndex];
    if (you) you.isPlaying = false;
    if (opponent) opponent.isPlaying = false;

    if (yourIndex !== -1) activeUser.splice(yourIndex, 1);

    if (
      you?.socketId &&
      opponent?.socketId &&
      you?.oponent &&
      opponent?.oponent
    ) {
      io.to([you.socketId, opponent.socketId]).emit("GET_WINNER", {
        winner: opponent,
        looser: you,
      });

      try {
        await Result.create({
          winner: opponent?.userId,
          looser: you?.userId,
        });
      } catch (error) {
        console.error("Result DB Error:", error?.message);
      }

      io.to([you.socketId, opponent.socketId]).emit("IS_PLAYING", false);
    }

    // Remove from current playing list
    console.log("Before:", currentPlayingUser);
    currentPlayingUser = currentPlayingUser.filter(
      (id) => id !== you?.userId && id !== opponent?.userId
    );
    console.log("After:", currentPlayingUser);

    emitUsers();
    emitCurrentPlayers();
  });

  // Initial logging
  // console.log("🟡 Current Players:", currentPlayingUser);
});

// Utility functions to emit
function emitUsers() {
  io.emit("ACTIVEUSERS", { activeuser: activeUser });
}
function emitCurrentPlayers() {
  console.log("emitin ", currentPlayingUser);
  io.emit("CURRENT_PLAYERS", { currentPlayingUser });
}

// Start server
server.listen(3000, () => {
  console.log("🚀 Server is running on http://localhost:3000");
});
