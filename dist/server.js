"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestLogger_1 = require("./middlewares/requestLogger");
const express_1 = __importDefault(require("express"));
const cors = require("cors");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const org_routes_1 = __importDefault(require("./routes/org.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors({
    origin: [process.env.DOMAIN, process.env.DOMAIN1],
    credentials: true,
}));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use(requestLogger_1.appLogger);
// Version 1 API prefix
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1", user_routes_1.default);
app.use("/api/v1", org_routes_1.default);
app.use("/api/v1/organizations", event_routes_1.default);
// testing API
app.get("/", (req, res) => {
    res.send("Backend running with CommonJS ");
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
