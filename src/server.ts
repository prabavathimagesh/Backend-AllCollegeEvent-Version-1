import { appLogger } from "./middlewares/requestLogger";
import express from 'express'
const cors = require("cors")
import dotenv from 'dotenv'
import authRoutes from "./routes/auth.routes"
import orgRoutes from "./routes/org.routes"
import userRoutes from "./routes/user.routes";
import path from 'path'

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [process.env.DOMAIN],
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(appLogger);

app.use("/acc", authRoutes);
app.use("/org", orgRoutes);
app.use("/user", userRoutes);

app.get("/", (req: any, res: any) => {
  res.send("Backend running with CommonJS ");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
