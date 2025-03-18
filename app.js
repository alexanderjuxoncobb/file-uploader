import express from "express";
const app = express();
import path from "node:path";
import indexRouter from "./routes/index.js";
import signupRouter from "./routes/signup.js";
import dashboardRouter from "./routes/dashBoard.js";

import session from "express-session";
import passport from "passport";
import configurePassport from "./db/passportConfig.js";
import flash from "connect-flash";

import { fileURLToPath } from "url";
import { dirname } from "path";

app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Session and Passport setup
app.use(
  session({
    secret: "members",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", indexRouter);
app.use("/signup", signupRouter);
app.use("/dashboard", dashboardRouter);

app.listen(8080, () => {
  console.log("First express app");
});
