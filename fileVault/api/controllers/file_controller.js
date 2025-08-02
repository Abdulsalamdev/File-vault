const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const FileRepository = require("../../repositories/file_repository");
const ThumbnailService = require("../../services/thumbnail_service");
const FileMetaData = require("../../models/file");
const SessionRepository = require("../../repositories/session_repository");
const UserRepository = require("../../repositories/user_repository");
const logger = require("../../utils/logger");
const ActivityLogger = require("../../services/activity_logger");
const mongoose = require("mongoose");

const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const FileController = {
  // Upload a file or create a folder
async upload(req, res) {
  try {
    const { name, type, parentId } = req.body;
    const userId = req.user._id;

    if (!name || !type) {
      ActivityLogger.log(userId, "UPLOAD_FAILED", {
        reason: "Missing name or type",
      });
      return res.status(400).json({ error: "Missing name or type" });
    }

    // Handle folders
    if (type === "folder") {
      const exists = await FileRepository.folderExists(name, userId, parentId);
      if (exists) {
        ActivityLogger.log(userId, "FOLDER_ALREADY_EXISTS", { name });
        return res.status(409).json({ error: "Folder already exists" });
      }

      const folder = await FileRepository.createFile({
        name,
        type: "folder",
        user_id: userId,
        parent_id: parentId || null,
        size: 0,
      });

      ActivityLogger.log(userId, "CREATE_FOLDER", {
        name,
        parentId: parentId || null,
      });

      return res.status(201).json(folder);
    }

    // Handle files
    if (!req.file) {
      ActivityLogger.log(userId, "UPLOAD_FAILED", {
        reason: "Missing file data",
        name,
        parentId: parentId || null,
      });
      return res.status(400).json({ error: "Missing file data" });
    }

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

    ActivityLogger.log(userId, "UPLOAD_FILE", {
      filename: name,
      fileType: mimeType,
      fileSize,
      parentId: parentId || null,
    });

    if (fileMeta.type === "image") {
      await ThumbnailService.generate(fileMeta._id.toString(), filePath);
    }

    return res.status(201).json(fileMeta);
  } catch (err) {
    console.error("Upload error:", err);
    ActivityLogger.error(req.user?._id || "guest", "UPLOAD_ERROR", err);
    return res.status(500).json({ error: "Internal server error" });
  }
},
  // List files or folders
async list(req, res) {
  try {
    const { parentId, type, name, visibility, page = 1, limit = 10 } = req.query;
    const token = req.headers["authorization"];
    let userId = null;

    if (token) {
      userId = await SessionRepository.get(token);
      if (userId) {
        const user = await UserRepository.findById(userId);
        if (user) {
          req.user = user;
        } else {
          userId = null;
        }
      }
    }

    const filters = {};
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      filters.parent_id = parentId;
    }
    if (type) filters.type = type;
    if (name) filters.name = new RegExp(name, "i"); // case-insensitive partial match
    if (visibility) filters.visibility = visibility;

    if (userId) {
      filters.user_id = userId;

      const files = await FileMetaData.find(filters)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await FileMetaData.countDocuments(filters);

      ActivityLogger.log(userId, "LIST_FILES_AUTHENTICATED", {
        parentId: parentId || null,
        filters,
        fileCount: files.length,
        total,
      });

      return res.json({ files, total, page: parseInt(page), limit: parseInt(limit) });
    }

    // Guest mode (public files only)
    filters.visibility = "public";
    const publicFiles = await FileMetaData.find(filters)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalPublic = await FileMetaData.countDocuments(filters);

    ActivityLogger.log(null, "LIST_FILES_PUBLIC", {
      parentId: parentId || null,
      filters,
      fileCount: publicFiles.length,
      total: totalPublic,
    });

    return res.json({ files: publicFiles, total: totalPublic, page: parseInt(page), limit: parseInt(limit) });

  } catch (err) {
    ActivityLogger.error(req.user?._id || "guest", "LIST_FILES_ERROR", err);
    console.error("List error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
},
// Get file or folder metadata
async get(req, res) {
  try {
    const fileId = req.params.id;
    const userId = req.user?._id || null;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
  return res.status(400).json({ error: "Invalid file ID format" });
}

    let file = await FileRepository.getFileById(fileId, userId);

    if (!file) {
      // Try to find public file
      file = await FileMetaData.findOne({
        _id: fileId,
        visibility: "public",
      });
    }

    if (!file) {
      ActivityLogger.log(userId, "GET_FILE_FAILED", { fileId });
      return res.status(404).json({ error: "File not found" });
    }

    // Log file access
    ActivityLogger.log(userId, "GET_FILE_SUCCESS", {
      fileId: file._id.toString(),
      fileName: file.name,
      visibility: file.visibility,
    });

    res.json(file);
  } catch (err) {
    console.error("Get file error:", err);
    ActivityLogger.error(req.user?._id, "GET_FILE_ERROR", err);
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

      if (!fs.existsSync(file.path))
        return res.status(404).json({ error: "File not found" });

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
      const thumbPath = path.join(
        __dirname,
        `../storage/thumbnails/${req.params.id}.jpg`
      );
      if (!fs.existsSync(thumbPath))
        return res.status(404).json({ error: "Thumbnail not found" });
      

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
  const fileId = req.params.id;
  const userId = req.user?._id;

  try {
    const file = await FileRepository.getFileById(fileId, userId);
    if (!file) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    await FileRepository.updateFileVisibility(file._id, visibility);

    // Log successful visibility change
    ActivityLogger.log(userId, `${visibility.toUpperCase()}_FILE`, {
      fileId: file._id,
      filename: file.name,
      visibility,
    });

    res.json({ message: `File is now ${visibility}` });

  } catch (err) {
    // Log any errors
    ActivityLogger.error(userId, `${visibility.toUpperCase()}_FILE_ERROR`, err);
    console.error(`Set ${visibility} error:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
},
};

module.exports = FileController;
