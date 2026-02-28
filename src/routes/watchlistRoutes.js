import express from "express"
import { addToWatchList , removeWatchList ,updateWatchListItem , getWatchList } from "../controller/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { addToWatchListSchema } from "../validators/watchlistValidators.js";

const router =express.Router();

router.use(authMiddleware);


router.post("/", validateRequest(addToWatchListSchema),addToWatchList);

//{BASEURL}/watchlist/:id
router.delete("/:id",removeWatchList);

//{BASEURL}/watchlist/:id
router.put("/:id",validateRequest,updateWatchListItem);


router.get("/",getWatchList);

// router.post("/login",login);

// router.post("/logout",logout);

export default router;