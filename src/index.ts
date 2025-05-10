import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import fs from "fs";
import https from "https";
import mongoose from "mongoose";
import * as errorHandler from "./middlewares/errorHandler";
import { requestHandler } from "./middlewares/request";
import { responseHandler } from "./middlewares/response";
import { router as authRoutes } from "./routes/auth";
import { ValidationError } from "./utils/error";
import { getConfig, parseNumber } from "./utils/config";

const app: Application = express();
const appName = getConfig<string>("appName");
const port = getConfig<number>("port", parseNumber);
const mongoUri = getConfig<string>("mongo.uri");

app.use(cors());
app.use(requestHandler);
app.use(responseHandler);

app.use(
  express.json(),
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
      return next(new ValidationError("Invalid JSON format", err.message));
    }
    next(err);
  }
);
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.get("/", (req: Request, res: Response) => {
  res.success(200, `${appName} is running!`, { time: new Date() });
});

// Trust proxies
app.enable("trust proxy");

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then((e) =>
    console.log(
      "Connected to MongoDB",
      e.connection.db?.databaseName,
      "on",
      e.connection.host
    )
  )
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Error handling
app.use(errorHandler.notFound);
app.use(errorHandler.error);

// Start the server
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
  // Railway environment
  app.listen(port, () => {
    console.log(`${appName} is running (Railway) on http://localhost:${port}`);
  });
} else {
  const options = {
    key: fs.readFileSync(getConfig<string>("ssl.key")),
    cert: fs.readFileSync(getConfig<string>("ssl.cert")),
  };
  https.createServer(options, app).listen(port, "0.0.0.0", () => {
    console.log(
      `${appName} is running (local HTTPS) on https://localhost:${port}`
    );
  });
}
