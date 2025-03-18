import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import * as userConfig from "../db/userConfig.js";
import { hash } from "crypto";

router.get("/", async (req, res, next) => {
  res.render("signup");
});

router.post("/", async (req, res, next) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.render("signup", { error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await userConfig.createUser(
      req.body.fullname,
      req.body.email,
      hashedPassword
    );

    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

export default router;
