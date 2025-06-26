import express from "express";
const router = express.Router();
import User from "../models/user.js";
import wrapAsync from "../utils/wrapAsync.js";
import passport from "passport";
import { saveRedirectUrl } from "../middleware.js";
import usersController from "../controller/users.js";

// BOTH SHOW AND SUBMIT FORM ROUTES FRO SIGNUP
router
  .route("/signup")
  .get(usersController.showSignUpForm)
  .post(wrapAsync(usersController.singUpToApp));

// BOTH SHOW AND SUBMIT FORM ROUTES FRO LOGIN
router
  .route("/login")
  .get(usersController.showLoginForm)
  .post(
    saveRedirectUrl, // we write this pice of code above the authentication becoz on authentication fucntion the passpot will reset the session storage.
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }), // actual login will be done by this mehtod of the passport npm module
    wrapAsync(usersController.logInToTheApp)
  );

router.get("/logout", usersController.logOutFromTheApp);

export default router;
