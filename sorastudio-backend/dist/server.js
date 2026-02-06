"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("./routes/upload"));
const task_1 = __importDefault(require("./routes/task"));
const app = (0, express_1.default)();
app.use("/api", upload_1.default);
app.use("/api", task_1.default);
app.listen(Number(process.env.PORT) || 3000, () => {
    console.log("Server running");
});
