/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Chat from "../models/Chat";

interface JwtPayload {
  userId: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Map to store active users and their socket IDs
  const activeUsers = new Map();

  io.on("connection", async (socket: Socket) => {
    console.log("New client connected: ", socket.id);

    // Add user to active users when they come online
    socket.on("setup", async (token) => {
      try {
        // Verify token and get user ID
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "fallback_secret"
        ) as JwtPayload;

        const userId = decoded.userId;

        // Add user to active users map
        activeUsers.set(userId, socket.id);

        // Join a room with the user's ID
        socket.join(userId);

        // Update user status in DB
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Emit online status to other users
        socket.broadcast.emit("user-online", userId);

        console.log("User online: ", userId);
      } catch (error) {
        console.error("Socket setup error:", error);
      }
    });

    // Handle joining a chat
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // Handle new message
    socket.on("new-message", (message) => {
      const chat = message.chat;

      if (!chat.users) {
        console.log("Chat users not defined");
        return;
      }

      // Send to all users in the chat except the sender
      chat.users.forEach((user: any) => {
        if (user._id === message.sender._id) return;

        // Send to user's room
        io.to(activeUsers.get(user._id)).emit("message-received", message);
      });
    });

    // Handle typing indicator
    socket.on("typing", (chatId, userId) => {
      socket.to(chatId).emit("typing", chatId, userId);
    });

    // Handle stop typing indicator
    socket.on("stop-typing", (chatId) => {
      socket.to(chatId).emit("stop-typing", chatId);
    });

    // Handle when user reads a message
    socket.on("message-read", async (messageId, userId) => {
      io.emit("message-read-update", messageId, userId);
    });

    // Handle user disconnect
    socket.on("disconnect", async () => {
      console.log("Client disconnected: ", socket.id);

      // Find user by socket ID and remove from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);

          // Update user status in DB
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Emit offline status to other users
          socket.broadcast.emit("user-offline", userId);

          console.log("User offline: ", userId);
          break;
        }
      }
    });
  });
};
