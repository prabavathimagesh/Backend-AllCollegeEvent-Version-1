import { appLogger } from "./middlewares/requestLogger";
import express from "express";
const cors = require("cors");
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import orgRoutes from "./routes/org.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import adminEventRoutes from "./routes/admin/admin.event.routes";
import adminUserRoutes from "./routes/admin/admin.user.routes";
import adminOrgRoutes from "./routes/admin/admin.org.routes";
import adminAuthRoutes from "./routes/admin/admin.auth.routes";
import masterRoutes from "./routes/master.routes";
import path from "path";
const cookieParser = require("cookie-parser");
const { CorsOptions } = require("cors");

dotenv.config();

const app = express();

// enabling JSON body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// enabling cross-origin access for allowed domains
const allowedOrigins = [
  "https://ace-fe-dev.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));
// exposing uploaded images/files publicly
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// logging every incoming request
app.use(appLogger);

// API routes with version prefix
app.use("/api/v1/auth", authRoutes); // authentication routes
app.use("/api/v1", userRoutes); // user-related routes
app.use("/api/v1", orgRoutes); // organization routes
app.use("/api/v1", eventRoutes); // event routes
app.use(
  "/api/v1/admin",
  adminEventRoutes,
  adminOrgRoutes,
  adminUserRoutes,
  adminAuthRoutes
); // admin API's
app.use("/api/v1/master", masterRoutes);

// testing root endpoint to check server status
app.get("/", (req: any, res: any) => {
  res.send("Backend running with CommonJS ");
});

// starting the express server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
