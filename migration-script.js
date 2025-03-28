// migration-script.js
// Run this script once to import your existing files into the database
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

async function migrateExistingFiles() {
  try {
    console.log("Starting migration of existing files...");

    // Get all files in the upload directory
    const files = fs.readdirSync(uploadDir);
    console.log(`Found ${files.length} files to migrate`);

    // Get the first user in the database to assign files to
    // Change this logic if you need to assign to specific users
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error("No users found in the database. Create a user first.");
      return;
    }

    // Process each file
    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      let mimetype = "application/octet-stream"; // Default

      if ([".jpg", ".jpeg"].includes(ext)) mimetype = "image/jpeg";
      else if (ext === ".png") mimetype = "image/png";
      else if (ext === ".gif") mimetype = "image/gif";
      else if (ext === ".pdf") mimetype = "application/pdf";
      else if (ext === ".txt") mimetype = "text/plain";

      // Check if file already exists in database
      const existingFile = await prisma.file.findFirst({
        where: {
          name: filename,
          userId: user.id,
        },
      });

      if (!existingFile) {
        // Create file entry in database
        await prisma.file.create({
          data: {
            name: filename,
            path: `/uploads/${filename}`,
            mimetype: mimetype,
            userId: user.id,
            // No folder assigned initially
          },
        });
        console.log(`Migrated: ${filename}`);
      } else {
        console.log(`Skipped existing file: ${filename}`);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateExistingFiles();
