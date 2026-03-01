"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsManager = exports.WebSocketManager = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("./auth");
class WebSocketManager {
    io = null;
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                credentials: true,
            },
        });
        this.setupMiddleware();
        this.setupHandlers();
    }
    setupMiddleware() {
        if (!this.io)
            return;
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;
                if (!token) {
                    return next(new Error("Authentication required"));
                }
                const decoded = (0, auth_1.verifyJwt)(token);
                if (!decoded) {
                    return next(new Error("Invalid token"));
                }
                socket.data.user = decoded;
                next();
            }
            catch (error) {
                next(new Error("Authentication failed"));
            }
        });
    }
    setupHandlers() {
        if (!this.io)
            return;
        this.io.on("connection", (socket) => {
            console.log(`User connected: ${socket.data.user?.id}`);
            // Join user-specific room
            const userId = socket.data.user?.id;
            if (userId) {
                socket.join(`user:${userId}`);
            }
            // Join creator room if user is a creator
            if (socket.data.user?.isCreator) {
                socket.join("creators");
            }
            socket.on("disconnect", () => {
                console.log(`User disconnected: ${userId}`);
            });
        });
    }
    // Send notification to specific user
    notifyUser(userId, event, data) {
        if (!this.io)
            return;
        this.io.to(`user:${userId}`).emit(event, data);
    }
    // Send notification to all creators
    notifyCreators(event, data) {
        if (!this.io)
            return;
        this.io.to("creators").emit(event, data);
    }
    // Broadcast to all connected clients
    broadcast(event, data) {
        if (!this.io)
            return;
        this.io.emit(event, data);
    }
    // Send order status update
    sendOrderUpdate(userId, orderId, status, data) {
        this.notifyUser(userId, "order:update", { orderId, status, ...data });
    }
    // Send new sale notification to creator
    sendNewSale(creatorId, saleData) {
        this.notifyUser(creatorId, "sale:new", saleData);
    }
    // Send review notification
    sendNewReview(productId, reviewData) {
        this.broadcast("review:new", { productId, ...reviewData });
    }
    // Send product status update
    sendProductUpdate(userId, productId, status) {
        this.notifyUser(userId, "product:update", { productId, status });
    }
}
exports.WebSocketManager = WebSocketManager;
exports.wsManager = new WebSocketManager();
