import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import * as userConfig from "../db/userConfig.js";
import passport from "passport";

router.get("/", async (req, res, next) => {
  if (req.user) {
    res.redirect("/dashboard");
  } else {
    res.render("login", { messages: req.flash() });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
    failureFlash: true,
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
