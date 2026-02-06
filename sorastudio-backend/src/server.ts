import express from "express";
import uploadRouter from "./routes/upload";
import taskRouter from "./routes/task";

const app = express();

app.use("/api", uploadRouter);
app.use("/api", taskRouter);

app.listen(Number(process.env.PORT) || 3000, () => {
  console.log("Server running");
});
