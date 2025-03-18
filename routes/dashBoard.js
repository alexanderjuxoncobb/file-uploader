import express from "express";
const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/", ensureAuthenticated, async (req, res, next) => {
  res.render("dashboard", { user: req.user });
});

export default router;
