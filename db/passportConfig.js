// config/passport.js
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
// import pool from "../db/pool.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function configurePassport(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },

      async (email, password, done) => {
        // Strategy implementation
        try {
          const user = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            return done(null, false, { message: "Incorrect email" });
          }

          const match = await bcrypt.compare(password, String(user.password));
          if (!match) {
            // passwords do not match!
            return done(null, false, { message: "Incorrect password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
      });

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
