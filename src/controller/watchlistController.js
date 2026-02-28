import { prisma } from "../config/db.js";
import { redis } from "../config/redis.js";

/* ======================================================
   GET WATCHLIST (WITH PAGINATION + REDIS CACHE)
====================================================== */
export const getWatchList = async (req, res, next) => {
  try {
    const userId = req.user.id; // consistent usage

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const cacheKey = `watchlist:${userId}:page:${page}:limit:${limit}`;

    // 1️⃣ Check Cache
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Serving from Redis cache");
      return res.status(200).json(cachedData);
    }

    // 2️⃣ Fetch From DB
    const items = await prisma.watchListItem.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.watchListItem.count({
      where: { userId },
    });

    const response = {
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: items,
    };

    // 3️⃣ Store in Redis (TTL 60 seconds)
    await redis.set(cacheKey, response, { ex: 60 });

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ADD TO WATCHLIST
====================================================== */
export const addToWatchList = async (req, res, next) => {
  try {
    const { movieId, status, rating, notes } = req.body;
    const userId = req.user.id;

    // Verify movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Check if already added
    const existing = await prisma.watchListItem.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Movie already in watchlist" });
    }

    const watchlistItem = await prisma.watchListItem.create({
      data: {
        userId,
        movieId,
        status: status || "PLANNED",
        rating,
        notes,
      },
    });

    await invalidateUserCache(userId);

    res.status(201).json({
      status: "success",
      data: { watchlistItem },
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   UPDATE WATCHLIST ITEM
====================================================== */
export const updateWatchListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, rating, notes } = req.body;

    const watchlistItem = await prisma.watchListItem.findUnique({
      where: { id: req.params.id },
    });

    if (!watchlistItem) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    if (watchlistItem.userId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;

    const updatedItem = await prisma.watchListItem.update({
      where: { id: req.params.id },
      data: updateData,
    });

    await invalidateUserCache(userId);

    res.status(200).json({
      status: "success",
      data: { watchlistItem: updatedItem },
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   REMOVE WATCHLIST ITEM
====================================================== */
export const removeWatchList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const watchListItem = await prisma.watchListItem.findUnique({
      where: { id: req.params.id },
    });

    if (!watchListItem) {
      return res.status(404).json({ error: "Watchlist item not found" });
    }

    if (watchListItem.userId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await prisma.watchListItem.delete({
      where: { id: req.params.id },
    });

    await invalidateUserCache(userId);

    res.status(200).json({
      status: "success",
      message: "Movie removed from watchlist",
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   CACHE INVALIDATION HELPER
====================================================== */
const invalidateUserCache = async (userId) => {
  try {
    // Since keys are page-based, simplest strategy:
    for (let page = 1; page <= 5; page++) {
      for (let limit of [5, 10]) {
        const key = `watchlist:${userId}:page:${page}:limit:${limit}`;
        await redis.del(key);
      }
    }
    console.log("User cache invalidated");
  } catch (err) {
    console.error("Redis invalidation error:", err);
  }
};
