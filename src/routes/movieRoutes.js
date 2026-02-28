import express from "express";
import { prisma } from "../config/db.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {validateRequest }from "../middleware/validateRequest.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validators/movieValidators.js";

const router = express.Router();

// GET all movies
router.get("/", async (req, res, next) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(movies);
  } catch (err) {
    next(err);
  }
});

// POST create movie
// router.post(
//   "/",
//   authMiddleware,
//   validateRequest(createMovieSchema),
//   async (req, res, next) => {
//     console.log("POST MOVIES HIT");
//     try {
//       const movie = await prisma.movie.create({
//         data: {
//           ...req.body,
//           createdBy: req.user.id,
//         },
//       });

//       res.status(201).json(movie);
//     } catch (err) {
//       next(err);
//     }
//   }
// );



//POST
router.post(
  "/",

  (req, res, next) => {
    console.log("M1 reached");
    next();
  },

  authMiddleware,

  (req, res, next) => {
    console.log("M2 reached");
    next();
  },

  validateRequest(createMovieSchema),

  (req, res, next) => {
    console.log("M3 reached");
    next();
  },

  async (req, res, next) => {
    console.log("HANDLER reached");

    try {
      const movie = await prisma.movie.create({
        data: {
          ...req.body,
          createdBy: req.user.id,
        },
      });

      res.status(201).json(movie);
    } catch (err) {
      next(err);
    }
  }
);

// PUT update movie
router.put(
  "/:id",
  authMiddleware,
  validateRequest(updateMovieSchema),
  async (req, res, next) => {
    try {
      const movie = await prisma.movie.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(movie);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE movie
router.delete(
  "/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      await prisma.movie.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Movie deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;