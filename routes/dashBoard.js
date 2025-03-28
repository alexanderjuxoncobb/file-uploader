import express from "express";
const router = express.Router();
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/", ensureAuthenticated, async (req, res, next) => {
  try {
    // Get folders from Prisma
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
    });

    // Get files from Prisma instead of filesystem
    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: null, // Only get files that aren't in any folder
      },
    });

    res.render("dashboard", {
      user: req.user,
      files: files,
      folders: folders,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Server error");
  }
});

router.post(
  "/upload",
  ensureAuthenticated,
  upload.single("fileToUpload"),
  async (req, res) => {
    const file = req.file;
    const folderId = req.body.folderId ? parseInt(req.body.folderId) : null;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const ext = path.extname(file.originalname).toLowerCase();
      let mimetype = "application/octet-stream"; // Default

      if ([".jpg", ".jpeg"].includes(ext)) mimetype = "image/jpeg";
      else if (ext === ".png") mimetype = "image/png";
      else if (ext === ".gif") mimetype = "image/gif";
      else if (ext === ".pdf") mimetype = "application/pdf";
      else if (ext === ".txt") mimetype = "text/plain";

      // Store file info in database
      await prisma.file.create({
        data: {
          name: file.originalname,
          path: `/uploads/${file.originalname}`,
          mimetype: mimetype,
          userId: req.user.id,
          folderId: folderId, // Link to folder if selected
        },
      });

      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error saving file to database:", error);
      res.status(500).send("Error saving file information");
    }
  }
);

router.post("/create-folder", ensureAuthenticated, async (req, res) => {
  const folderName = req.body.folderName;

  if (!folderName) {
    return res.status(400).send("Folder name is required");
  }

  try {
    // Check if folder already exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: folderName,
        userId: req.user.id,
      },
    });

    if (!existingFolder) {
      // Create new folder in database
      await prisma.folder.create({
        data: {
          name: folderName,
          userId: req.user.id,
        },
      });
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Error creating folder");
  }
});

router.get("/folder/:folderId", ensureAuthenticated, async (req, res) => {
  const folderId = parseInt(req.params.folderId);

  try {
    // Get all folders for this user
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
    });

    // Check if folder exists and belongs to user
    const currentFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: req.user.id,
      },
    });

    if (!currentFolder) {
      return res.redirect("/dashboard");
    }

    // Get files in this folder
    const files = await prisma.file.findMany({
      where: {
        folderId: folderId,
        userId: req.user.id,
      },
    });

    res.render("folder", {
      user: req.user,
      files: files,
      folders: folders,
      currentFolder: currentFolder,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Server error");
  }
});

router.get("/view/:fileId", ensureAuthenticated, async (req, res) => {
  const fileId = parseInt(req.params.fileId);

  try {
    // Get file from database
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const filepath = path.join(uploadDir, file.name);

    // Check if file exists in filesystem
    if (!fs.existsSync(filepath)) {
      return res.status(404).send("File not found on server");
    }

    // Set headers to display in browser
    res.setHeader("Content-Type", file.mimetype || "application/octet-stream");
    res.setHeader("Content-Disposition", "inline");

    fs.createReadStream(filepath).pipe(res);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Server error");
  }
});

router.post("/folder/delete", ensureAuthenticated, async (req, res) => {
  const folderId = parseInt(req.query.folderId);

  console.log(folderId);

  try {
    await prisma.$transaction([
      prisma.file.deleteMany({
        where: {
          folderId: folderId,
        },
      }),
      prisma.folder.delete({
        where: {
          id: folderId,
        },
      }),
    ]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

router.post("/folder/rename", ensureAuthenticated, async (req, res) => {
  const folderId = parseInt(req.body.folderId);
  const newName = req.body.newFolderName;

  if (!newName || !folderId) {
    return res.status(400).send("Folder ID and new name are required");
  }

  try {
    await prisma.folder.update({
      where: {
        id: folderId,
        userId: req.user.id,
      },
      data: {
        name: newName,
      },
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).send("Error renaming folder");
  }
});

export default router;
export { uploadDir };
