const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const FileRepository = require("../../repositories/file_repository");
const ThumbnailService = require("../../services/thumbnail_service");
const FileMetaData = require("../../models/file");

const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const FileController = {
    // Upload a file or create a folder
  async upload(req, res) {
    try {
      const { name, type, parentId } = req.body;
      const userId = req.user._id;

      if (!name || !type)
        return res.status(400).json({ error: "Missing name or type" });

      // Handle folders
      if (type === "folder") {
        const exists = await FileRepository.folderExists(name, userId, parentId);
        if (exists)
          return res.status(409).json({ error: "Folder already exists" });

        const folder = await FileRepository.createFile({
          name,
          type: "folder",
          user_id: userId,
          parent_id: parentId || null,
          size: 0,
        });

        return res.status(201).json(folder);
      }

      // Handle files
      if (!req.file)
        return res.status(400).json({ error: "Missing file data" });

      const filePath = req.file.path;
      const mimeType = mime.lookup(req.file.originalname) || "application/octet-stream";
      const fileSize = fs.statSync(filePath).size;

      const fileMeta = await FileRepository.createFile({
        name,
        type: mimeType.startsWith("image/") ? "image" : "file",
        path: filePath,
        size: fileSize,
        mime_type: mimeType,
        user_id: userId,
        parent_id: parentId || null,
      });

      if (fileMeta.type === "image") {
        await ThumbnailService.generate(fileMeta._id.toString(), filePath);
      }

      return res.status(201).json(fileMeta);
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
// List files or folders
  async list(req, res) {
    try {
      const userId = req.user._id;
      const { parentId } = req.query;

      const files = parentId
        ? await FileRepository.getFilesByParent(userId, parentId)
        : await FileRepository.getFilesByUser(userId);

      res.json(files);
    } catch (err) {
      console.error("List error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
// Get file or folder metadata
  async get(req, res) {
    try {
      const fileId = req.params.id;
      const userId = req.user?._id;

      let file = await FileRepository.getFileById(fileId, userId);
      if (!file) {
        file = await FileMetaData.findOne({ _id: fileId, visibility: "public" });
      }

      if (!file) return res.status(404).json({ error: "File not found" });

      res.json(file);
    } catch (err) {
      console.error("Get file error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
// Serve file data
  async serveFile(req, res) {
    try {
      const file = await FileMetaData.findById(req.params.id);
      const isOwner = file.user_id.toString() === req.user?._id?.toString();

      if (!file || (file.visibility !== "public" && !isOwner)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!fs.existsSync(file.path)) return res.status(404).json({ error: "File not found" });

      res.setHeader("Content-Type", file.mime_type);
      fs.createReadStream(file.path).pipe(res);
    } catch (err) {
      console.error("Serve file error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
// Serve thumbnail
  async serveThumbnail(req, res) {
    try {
      const thumbPath = path.join(__dirname, `../storage/thumbnails/${req.params.id}.jpg`);
      if (!fs.existsSync(thumbPath)) return res.status(404).json({ error: "Thumbnail not found" });

      res.setHeader("Content-Type", "image/jpeg");
      fs.createReadStream(thumbPath).pipe(res);
    } catch (err) {
      console.error("Serve thumbnail error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
// Publish a file
  async publish(req, res) {
    return FileController.setVisibility(req, res, "public");
  },
// Unpublish a file
  async unpublish(req, res) {
    return FileController.setVisibility(req, res, "private");
  },
// Set file visibility
  async setVisibility(req, res, visibility) {
    try {
      const userId = req.user._id;
      const file = await FileRepository.getFileByMongoId(req.params.id, userId);
      if (!file) return res.status(404).json({ error: "File not found or unauthorized" });

      await FileRepository.updateFileVisibility(file._id, visibility);
      res.json({ message: `File is now ${visibility}` });
    } catch (err) {
      console.error(`Set ${visibility} error:`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = FileController;
