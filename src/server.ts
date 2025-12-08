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

app.use(express.json());
app.use(
  cors({
    origin: [process.env.DOMAIN,process.env.DOMAIN1],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(appLogger);

// Version 1 API prefix
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orgRoutes);
app.use("/api/v1",eventRoutes)
app.use("/api/v1/admin",adminRoutes)

// testing API
app.get("/", (req: any, res: any) => {
  res.send("Backend running with CommonJS ");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
