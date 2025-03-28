// import pool from "./pool.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createUser(email, passwordHash) {
  await prisma.user.create({
    data: {
      email: email,
      password: passwordHash,
    },
  });
}

export { createUser };
