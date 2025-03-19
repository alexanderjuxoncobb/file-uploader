import pool from "./pool.js";

async function createUser(fullname, email, passwordHash) {
  await pool.query(
    'INSERT INTO "members-only" ("full-name", email, password) VALUES($1, $2, $3)',
    [fullname, email, passwordHash]
  );
}

async function addMembership(id) {
  await pool.query(
    'UPDATE "members-only" SET "membership-status" = true WHERE id = $1;',
    [id]
  );
}

async function addAdmin(id) {
  await pool.query('UPDATE "members-only" SET admin = true WHERE id = $1;', [
    id,
  ]);
}

export { createUser, addMembership, addAdmin };
