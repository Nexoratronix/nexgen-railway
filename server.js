// require('dotenv').config();
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const next = require("next");
// const { createClient } = require("redis");
// const { parse } = require("url");

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// // Initialize Redis clients
// const redisClient = require("redis").createClient({
//   host: "localhost",
//   port: 6379,
// });


// const redisPublisher = createClient({
//   url: process.env.REDIS_URL || "redis://localhost:6379",
// });
// const redisSubscriber = createClient({
//   url: process.env.REDIS_URL || "redis://localhost:6379",
// });

// // Handle Redis connection errors
// redisPublisher.on("error", (error) => {
//   console.error("Redis publisher error:", error);
// });

// redisSubscriber.on("error", (error) => {
//   console.error("Redis subscriber error:", error);
// });

// // Wait for Redis connections to be established
// const connectRedis = async () => {
//   try {
//     await redisPublisher.connect();
//     console.log("Redis publisher connected successfully");
//   } catch (error) {
//     console.error("Failed to connect Redis publisher:", error);
//     throw error;
//   }

//   try {
//     await redisSubscriber.connect();
//     console.log("Redis subscriber connected successfully");
//   } catch (error) {
//     console.error("Failed to connect Redis subscriber:", error);
//     throw error;
//   }
// };

// app.prepare().then(async () => {
//   try {
//     // Wait for Redis to connect before starting the server
//     await connectRedis();

//     const server = createServer((req, res) => {
//       console.log(`Incoming request: ${req.method} ${req.url}`);
//       const parsedUrl = parse(req.url, true);
//       const { pathname } = parsedUrl;

//       if (pathname.startsWith("/socket.io")) {
//         return;
//       }

//       handle(req, res, parsedUrl);
//     });

//     const io = new Server(server, {
//       cors: {
//         origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
//         methods: ["GET", "POST"],
//       },
//       path: "/socket.io",
//     });

//     io.on("connection", (socket) => {
//       console.log("A user connected:", socket.id);

//       socket.on("join", (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} joined room`);

//         redisSubscriber.subscribe(`notifications:${userId}`, (message) => {
//           const notification = JSON.parse(message);
//           socket.emit("newNotification", notification);
//         });
//       });

//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//       });
//     });

//     global.io = io;
//     global.redisPublisher = redisPublisher;

//     server.listen(process.env.PORT || 3000, (err) => {
//       if (err) throw err;
//       console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
//     });

//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// });

// redisPublisher.on("connect", () => console.log("Redis publisher connected"));
// redisPublisher.on("error", (error) => console.error("Redis publisher error:", error));
// redisSubscriber.on("connect", () => console.log("Redis subscriber connected"));
// redisSubscriber.on("error", (error) => console.error("Redis subscriber error:", error));



require('dotenv').config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const { createClient } = require("redis");
const { parse } = require("url");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

console.log("REDIS_URL from env:", process.env.REDIS_URL); 

const redisPublisher = createClient({
  url: process.env.REDIS_URL || "redis://default:s4w7uQa10SzmKe20qlD7NNyyW0nwCNkG@redis-12787.c301.ap-south-1-1.ec2.redns.redis-cloud.com:12787",
  socket: {
    connectTimeout: 30000, // 30 seconds timeout
    reconnectStrategy: (retries) => Math.min(retries * 1000, 5000), // Retry with backoff up to 5 seconds
  },
});
const redisSubscriber = createClient({
  url: process.env.REDIS_URL || "redis://default:s4w7uQa10SzmKe20qlD7NNyyW0nwCNkG@redis-12787.c301.ap-south-1-1.ec2.redns.redis-cloud.com:12787",
  socket: {
    connectTimeout: 30000,
    reconnectStrategy: (retries) => Math.min(retries * 1000, 5000),
  },
});

redisPublisher.on("connect", () => console.log("Redis publisher connected"));
redisPublisher.on("error", (error) => console.error("Redis publisher error:", error.message, error.stack));
redisSubscriber.on("connect", () => console.log("Redis subscriber connected"));
redisSubscriber.on("error", (error) => console.error("Redis subscriber error:", error.message, error.stack));

const connectRedis = async () => {
  try {
    console.log("Attempting to connect Redis publisher to:", process.env.REDIS_URL);
    await redisPublisher.connect();
    console.log("Redis publisher connected successfully");
  } catch (error) {
    console.error("Failed to connect Redis publisher:", error.message, error.stack);
  }

  try {
    console.log("Attempting to connect Redis subscriber to:", process.env.REDIS_URL);
    await redisSubscriber.connect();
    console.log("Redis subscriber connected successfully");
  } catch (error) {
    console.error("Failed to connect Redis subscriber:", error.message, error.stack);
  }
};

app.prepare().then(async () => {
  try {
    await connectRedis();

    const server = createServer((req, res) => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      if (pathname.startsWith("/socket.io")) {
        return;
      }

      handle(req, res, parsedUrl);
    });

    const io = new Server(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      path: "/socket.io",
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);
      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
        redisSubscriber.subscribe(`notifications:${userId}`, (message) => {
          console.log(`Received notification for user ${userId}: ${message}`);
          const notification = JSON.parse(message);
          socket.emit("newNotification", notification);
        });
      });
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    global.io = io;
    global.redisPublisher = redisPublisher;

    server.listen(process.env.PORT || 3000, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
});