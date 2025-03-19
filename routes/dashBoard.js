import express from "express";
const router = express.Router();

import { addMembership, addAdmin } from "../db/userConfig.js";
import {
  addMessage,
  getMessages,
  deleteMessage,
} from "../db/messagesConfig.js";

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/", ensureAuthenticated, async (req, res, next) => {
  const messages = await getMessages();
  res.render("dashboard", { user: req.user, messages: messages });
  console.log(req.user.email, messages);
});

router.post("/password", ensureAuthenticated, async (req, res) => {
  if (req.body.password === "password123") {
    await addMembership(req.user.id);
  }
  console.log(req.user["membership-status"]);
  res.redirect("/");
});

router.post("/admin", ensureAuthenticated, async (req, res) => {
  if (req.body.admin === "admin123") {
    await addAdmin(req.user.id);
  }
  console.log(req.user.admin);
  res.redirect("/");
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  await addMessage(req.body.message, req.body.title, req.user.id);
  res.redirect("/");
});

router.post("/delete", ensureAuthenticated, async (req, res) => {
  await deleteMessage(req.body.messageId);
  res.redirect("/");
});

export default router;
