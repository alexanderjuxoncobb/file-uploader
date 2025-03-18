import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

// Again, this should be read from an environment variable
export default new Pool({
  connectionString: process.env.HOST,
  ssl: {
    rejectUnauthorized: false,
  },
});
