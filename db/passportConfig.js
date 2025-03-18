// config/passport.js
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

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
          const { rows } = await pool.query(
            'SELECT * FROM "members-only" WHERE email = $1',
            [email]
          );
          const user = rows[0];

          if (!user) {
            return done(null, false, { message: "Incorrect email" });
          }
          console.log(typeof password, typeof String(user.password));
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
      const { rows } = await pool.query(
        'SELECT * FROM "members-only" WHERE id = $1',
        [id]
      );
      const user = rows[0];

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
