import { cloudinary } from "../cloudConfig.js";
import { Listing } from "../models/Listing.js";

let index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

let displayForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
};

let displayLocations = async (req, res) => {
  const ID = req.params.id;
  // nested-populate is used here...
  const listing = await Listing.findById(ID)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Location requested for does not exist in database 🤨");
    res.redirect("/listings");
  } else {
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  }
};

let addLocation = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(URL, "::", filename);
  const data = req.body;
  const list = new Listing(data);
  list.owner = req.user._id;
  list.image = { url, filename };
  await list.save();
  console.log(data);
  req.flash("success", "New Location Added!");
  res.redirect("/listings"); // in redirect we should mention the actual router, parent path will not be copies here in redirect method
};

let displayEditForm = async (req, res) => {
  const ID = req.params.id;
  const listing = await Listing.findById(ID);
  if (!listing) {
    req.flash("error", "you cant edit a non-existant location 😐");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace(
      "/upload",
      "/upload/h_300,w_250"
    ); // decreasing the quality of the image to display in the edit form we replace the image url with filtered image url provided by cloudinary
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  }
};

let editLocation = async (req, res) => {
  const ID = req.params.id;
  const data = req.body;
  if (req.file) {
    const listing = await Listing.findById(ID);
    if (listing.image?.filename) {
      await cloudinary.uploader.destroy(listing.image.filename); // this will delete the old image from the cloud as well
    }
    let url = req.file.path;
    let filename = req.file.filename;
    data.image = { url, filename };
  }
  await Listing.findByIdAndUpdate(ID, data);
  req.flash("success", "Location Updated!");
  res.redirect(`/listings/${ID}`);
};

let destroyLocation = async (req, res) => {
  const ID = req.params.id;
  const listing = await Listing.findByIdAndDelete(ID);
  if (listing.image?.filename) {
    await cloudinary.uploader.destroy(listing.image.filename); // this will delete the old image from the cloud as well
  }
  req.flash("success", "Location Deleted Successfully!");
  res.redirect("/listings");
};

export default {
  index,
  displayForm,
  displayLocations,
  addLocation,
  displayEditForm,
  editLocation,
  destroyLocation,
};
