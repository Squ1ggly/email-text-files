import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import assert from "node:assert";
import mainRouter from "./routers/main-router";
import errorMiddleware from "./middleware/error-middleware";
import cors from "cors";
config();

const PORT = process.env.PORT;

assert(PORT, "Must have port configured in .env");
assert(process.env.CLIENT_ID, "Must have CLIENT_ID configured in .env");
assert(process.env.CLIENT_SECRET, "Must have CLIENT_SECRET configured in .env");
assert(process.env.TENANT, "Must have TENANT configured in .env");

process.on("uncaughtExceptionMonitor", (e) => {
  console.error(e);
});

process.on("uncaughtException", (e) => {
  console.error("Uncaught exception: " + e);
});

function serverStart() {
  const app = express();

  app.use(cors());

  app.use((req, res, next) => {
    console.log(`${req.method} request received PATH: ${req.originalUrl}`);
    next();
  });

  app.use(
    bodyParser.json({
      limit: "20mb",
      type: "application/json",
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      }
    })
  );

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/", mainRouter);
  app.listen(PORT, () => {
    console.log(`Example app listening on port localhost:${PORT}`);
  });
  app.use(errorMiddleware);
}
serverStart();
