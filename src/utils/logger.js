import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const errorTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "10m",
  maxFiles: "7d",
});

const combinedTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "10m",
  maxFiles: "7d",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [errorTransport, combinedTransport],
});

export default logger;