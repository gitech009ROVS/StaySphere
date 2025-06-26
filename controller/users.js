import User from "../models/user.js";

let showSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

let singUpToApp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerdUser = await User.register(newUser, password);
    console.log(registerdUser);
    req.login(registerdUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to StaySphere!");
      return res.redirect("/listings"); // this redirecting page will be updated in the future once all the pages are constructed
    });
  } catch (err) {
    console.error(err);
    req.flash("error", err.message || "Username or email already exists.");
    return res.redirect("/signup");
  }
};

let showLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

let logInToTheApp = async (req, res) => {
  req.flash("success", "welcom back to StaySphere");
  let redirectUrl = res.locals.redirectUrl || "/listings"; // if redirect URL is empty then use /listings route as default
  res.redirect(redirectUrl); // go back to the page from which asked us to authorize via login
};

let logOutFromTheApp = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    } else {
      req.flash("success", "you are logged out!");
      res.redirect("/listings");
    }
  });
};

export default {
  showSignUpForm,
  singUpToApp,
  showLoginForm,
  logInToTheApp,
  logOutFromTheApp,
};
