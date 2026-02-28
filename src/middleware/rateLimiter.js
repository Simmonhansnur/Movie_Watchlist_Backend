import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  handler: (req, res) => {

    logger.warn({
      message: "Rate limit exceeded",
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    res.status(429).json({
      status: "fail",
      message: "Too many login attempts. Try again later.",
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter };