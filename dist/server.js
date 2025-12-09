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
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// enabling JSON body parsing
app.use(express_1.default.json());
// enabling cross-origin access for allowed domains
app.use(cors({
    origin: [process.env.DOMAIN, process.env.DOMAIN1],
    credentials: true,
}));
// exposing uploaded images/files publicly
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// logging every incoming request
app.use(requestLogger_1.appLogger);
// API routes with version prefix
app.use("/api/v1/auth", auth_routes_1.default); // authentication routes
app.use("/api/v1", user_routes_1.default); // user-related routes
app.use("/api/v1", org_routes_1.default); // organization routes
app.use("/api/v1", event_routes_1.default); // event routes
app.use("/api/v1/admin", admin_routes_1.default); // admin-specific routes
// testing root endpoint to check server status
app.get("/", (req, res) => {
    res.send("Backend running with CommonJS ");
});
// starting the express server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
