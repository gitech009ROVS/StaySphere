import express from "express";
import session from "express-session";
import { Listing } from "./models/Listing.js";
import { ExpressError } from "./utils/ExpressError.js";
import { listingSchema } from "./schema.js"; // uses joi npm package to validate the schema of the database
import { reviewSchema } from "./schema.js";
import { Review } from "./models/reviews.js";

let isLoggedIn = (req, res, next) => {
  console.log(req.path, "..", req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; // this req.originalURL will have the path due to which this login page is called on
    req.flash("error", "You must be Logged in to use the feature!");
    return res.redirect("/login");
  } else next();
};

let saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

let isOwner = async (req, res, next) => {
  const ID = req.params.id;
  const data = req.body;
  let listing = await Listing.findById(ID);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    // server-side authorization
    req.flash("error", "you dont have persmission to edit");
    return res.redirect(`/listings/${ID}`); // if we dont return then the code below this will also be executed and the wrong data will be updated
  }
  next();
};

let isReviwAuthor = async (req, res, next) => {
  const userId = req.params.id;
  const ID = req.params.reviewId;
  const data = req.body;
  let review = await Review.findById(ID);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    // server-side authorization
    req.flash("error", "you dont have persmission to edit");
    return res.redirect(`/listings/${userId}`); // if we dont return then the code below this will also be executed and the wrong data will be updated
  }
  next();
};

// middleware for listing the location form
let validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// middleware for the reviews form
let validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

export {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  validateListing,
  validateReview,
  isReviwAuthor,
};
