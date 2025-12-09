import { appLogger } from "./middlewares/requestLogger";
import express from 'express'
const cors = require("cors")
import dotenv from 'dotenv'
import authRoutes from "./routes/auth.routes"
import orgRoutes from "./routes/org.routes"
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes"
import adminRoutes from './routes/admin.routes'
import path from 'path'

dotenv.config();

const app = express();

// enabling JSON body parsing
app.use(express.json());

// enabling cross-origin access for allowed domains
app.use(
  cors({
    origin: [process.env.DOMAIN, process.env.DOMAIN1],
    credentials: true,
  })
);

// exposing uploaded images/files publicly
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// logging every incoming request
app.use(appLogger);

// API routes with version prefix
app.use("/api/v1/auth", authRoutes);     // authentication routes
app.use("/api/v1", userRoutes);          // user-related routes
app.use("/api/v1", orgRoutes);           // organization routes
app.use("/api/v1", eventRoutes);         // event routes
app.use("/api/v1/admin", adminRoutes);   // admin-specific routes

// testing root endpoint to check server status
app.get("/", (req: any, res: any) => {
  res.send("Backend running with CommonJS ");
});

// starting the express server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
