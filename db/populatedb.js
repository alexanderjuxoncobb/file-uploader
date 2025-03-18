#! /usr/bin/env node
import pool from "./pool.js";

const SQL = `
CREATE TABLE IF NOT EXISTS "members-only" (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "full-name" VARCHAR ( 255 ),
  email VARCHAR ( 255 ),
  password VARCHAR ( 255 ),
  "membership-status" VARCHAR ( 255 )
);

INSERT INTO "members-only" ("full-name", email, password, "membership-status") 
VALUES
  ('Charli', 'charli@123.gmail.com', 'password123', 'Y');
  
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER REFERENCES "members-only"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  text BOOLEAN DEFAULT false
);
  
  
  
  `;

async function main() {
  console.log("seeding again...");

  try {
    // await pool.connect();
    await pool.query(SQL);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
    console.log("done");
  }
}

main();
