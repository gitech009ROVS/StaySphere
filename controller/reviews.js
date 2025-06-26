import { Review } from "../models/reviews.js";
import { Listing } from "../models/Listing.js";

let postReview = async (req, res) => {
  const ID = req.params.id;
  let listing = await Listing.findById(ID);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  console.log(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${ID}`);
};

let destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull operator is used when we want to delete an element from an array element present in the document which ever matches the supplied condition
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted Sucessfully!");
  res.redirect(`/listings/${id}`);
};

export default { postReview, destroyReview };
