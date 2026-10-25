import express from "express";
import { pagesRouter } from "./routes/pages.routes.js";

const app = express();

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
