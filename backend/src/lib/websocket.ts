import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyJwt } from "./auth";

export class WebSocketManager {
  private io: SocketServer | null = null;

  initialize(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error("Authentication required"));
        }

        const decoded = verifyJwt(token as string);
        if (!decoded) {
          return next(new Error("Invalid token"));
        }

        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupHandlers() {
    if (!this.io) return;

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
  notifyUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send notification to all creators
  notifyCreators(event: string, data: any) {
    if (!this.io) return;
    this.io.to("creators").emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Send order status update
  sendOrderUpdate(userId: string, orderId: string, status: string, data?: any) {
    this.notifyUser(userId, "order:update", { orderId, status, ...data });
  }

  // Send new sale notification to creator
  sendNewSale(creatorId: string, saleData: {
    orderId: string;
    productName: string;
    amount: number;
    buyerName: string;
  }) {
    this.notifyUser(creatorId, "sale:new", saleData);
  }

  // Send review notification
  sendNewReview(productId: string, reviewData: {
    rating: number;
    title: string;
    reviewerName: string;
  }) {
    this.broadcast("review:new", { productId, ...reviewData });
  }

  // Send product status update
  sendProductUpdate(userId: string, productId: string, status: "published" | "unpublished" | "updated") {
    this.notifyUser(userId, "product:update", { productId, status });
  }
}

export const wsManager = new WebSocketManager();
