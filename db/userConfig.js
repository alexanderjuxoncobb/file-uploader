import pool from "./pool.js";

async function createUser(fullname, email, passwordHash) {
  await pool.query(
    'INSERT INTO "members-only" ("full-name", email, password) VALUES($1, $2, $3)',
    [fullname, email, passwordHash]
  );
}

export { createUser };
