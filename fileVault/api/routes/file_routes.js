const express = require("express");
const multer = require("multer");
const FileController = require("../controllers/file_controller");
const authMiddleware = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createFileSchema } = require("../../validators/fileValidator")
const { getFileByIdSchema } = require("../../validators/fileValidator");
const router = express.Router();
const upload = multer({ dest: "api/storage/uploads/" });

// Upload a file or create a folder
router.post("/files", validate(createFileSchema),authMiddleware, upload.single("file"), FileController.upload);
// get file or folder metadata
router.get("/files", FileController.list);
// list files in a folder
router.get("/files/:id", validate(getFileByIdSchema, "params"), FileController.get);

// Visibility Control
router.put("/files/:id/publish", validate(getFileByIdSchema, "params"), authMiddleware, FileController.publish);
router.put("/files/:id/unpublish", validate(getFileByIdSchema, "params"), authMiddleware, FileController.unpublish);

// Static Access
router.get("/files/:id/data", authMiddleware, FileController.serveFile);
router.get("/files/:id/thumbnail", FileController.serveThumbnail);

module.exports = router;
