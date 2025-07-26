const express = require("express");
const multer = require("multer");
const FileController = require("../controllers/file_controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: "api/storage/uploads/" });

// File & Folder Endpoints
// Upload a file or create a folder
router.post("/files", authMiddleware, upload.single("file"), FileController.upload);
// get file or folder metadata
router.get("/files", authMiddleware, FileController.list);
// list files in a folder
router.get("/files/:id", FileController.get);

// Visibility Control
router.put("/files/:id/publish", authMiddleware, FileController.publish);
router.put("/files/:id/unpublish", authMiddleware, FileController.unpublish);

// Static Access
router.get("/files/:id/data", authMiddleware, FileController.serveFile);
router.get("/files/:id/thumbnail", FileController.serveThumbnail);

module.exports = router;
