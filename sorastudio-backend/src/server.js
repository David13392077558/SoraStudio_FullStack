import express from "express";
import uploadRouter from "./routes/upload.js";
import taskRouter from "./routes/task.js";

const app = express();

app.use("/api", uploadRouter);
app.use("/api", taskRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
