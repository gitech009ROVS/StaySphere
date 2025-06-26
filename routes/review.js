import express from "express";
import wrapAsync from "../utils/wrapAsync.js"; // wrapAsync is used to handle the error occured in the middle ware due to the
import { Listing } from "../models/Listing.js";
import { Review } from "../models/reviews.js";
import { isReviwAuthor, validateReview } from "../middleware.js";
import { isLoggedIn } from "../middleware.js";
import reviewsController from "../controller/reviews.js"; // reviews controller for all the call-back functions in the file

// creating the instance of the router object
const router = express.Router({ mergeParams: true }); // if we set this mergeParams to 'true' then the params present in the parent path of the router will be sent to the router, otherwise by default margeParams is false, i.e params present in the parent path will not be sent to the described router.

// post review route
router.post(
  "/",
  isLoggedIn, // server-side authorization
  validateReview,
  wrapAsync(reviewsController.postReview)
);

// delete review route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviwAuthor,
  wrapAsync(reviewsController.destroyReview)
);

export default router;
