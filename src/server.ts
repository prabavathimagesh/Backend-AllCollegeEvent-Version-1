import { appLogger } from "./middlewares/requestLogger";
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [process.env.DOMAIN],
    credentials: true,
  })
);

app.use(appLogger);

app.use("/acc", authRoutes);
app.use("/org", eventRoutes);

app.get("/", (req: any, res: any) => {
  res.send("Backend running with CommonJS ");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
