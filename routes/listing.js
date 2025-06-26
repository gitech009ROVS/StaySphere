import express from "express";
import wrapAsync from "../utils/wrapAsync.js"; // wrapAsync is used to handle the error occured in the middle ware due to the

import { isLoggedIn } from "../middleware.js"; // middleware to check authorize the user to create or edit a location
import { isOwner } from "../middleware.js";
import { validateListing } from "../middleware.js";
import listingController from "../controller/listings.js"; // all the call-back functions for each of the below route are been imported from this file (in wrapAsync Function and some are not in wrap Async also) == CONTROLLER FOR LISTINGS
import { storage } from "../cloudConfig.js";
import multer from "multer";

const upload = multer({ storage }); // the storage imported from the cloudConfig file is passed as param insted of des

// creating the instance of the router object
const router = express.Router();

// INDEX ROUTE + CREATE ROUTE : got chained using router.route(), as they share the same path
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  upload.single("image"),
  validateListing, // this is the custom middleware which validates the schema
  wrapAsync(listingController.addLocation)
);

// NEW ROUTE - we should define this before the router.route("/:id"), else it will take the new as :id
router.get("/new", isLoggedIn, listingController.displayForm);

// SHOW ROUTE + UPDATE ROUTE + DELETE ROUTE : share the same path
router
  .route("/:id")
  .get(wrapAsync(listingController.displayLocations))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.editLocation)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyLocation));

// EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.displayEditForm)
);

export default router;
