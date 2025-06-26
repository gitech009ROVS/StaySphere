import dotenv from "dotenv";
if (process.env.NODE_ENV != "production") {
  //as there is no NODE_ENV in the .env file so this is always true
  // once we deploy our app, there we will add a key called NODE_ENV in .env file which will automatically
  // disable the connection to .env file due to this if condition
  dotenv.config();
}
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import ejsMate from "ejs-mate";
import { ExpressError } from "./utils/ExpressError.js";
import listingRouter from "./routes/listing.js";
import reviewRouter from "./routes/review.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import User from "./models/user.js";
import userRouter from "./routes/user.js";
import { saveRedirectUrl } from "./middleware.js";

const app = express();
const port = 8080;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// const MONGO_URL = "mongodb://127.0.0.1:27017/staysphere";
const DB_URL = process.env.ATLAS_DB_URL;

async function main() {
  await mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // time to wait for connection
  });
}

main()
  .then((data) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const store = MongoStore.create({
  mongoUrl: DB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // this implies once login remember the credentials for 24hrs
});

store.on("error", (err) => {
  console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store: store, // this is done becoz our machines session memory is very less, so we use mongo store to use the session data
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // seurity purpose
  },
};

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());
// the passport middleware should be written after session middleware as passport uses session in it.
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// authenticate() : Generates a function that is used in Passport's LocalStrategy

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  console.log(res.locals.success);
  console.log(res.locals.error);
  next(); // imp
});

// app.get("/", (req, res) => {
//   res.render("listings/home.ejs");
// });

// listings - routes

app.use("/listings", listingRouter);

// Reviews - routes

app.use("/listings/:id/reviews", reviewRouter);

// User Signup -  routes

app.use("/", userRouter);

// ------------ END OF ROUTES ------------ //

app.all("/{*any}", (req, res, next) => {
  // all the routes which are not mentione above will lead to the page-not-found page
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`The server is listening at the port ${port}`);
});
