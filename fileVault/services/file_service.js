const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { formatSize } = require("../utils/helpers");
const { getAuthenticatedUser } = require("../utils/auth");
const FileMetaData = require("../models/file");
const mime = require("mime-types");
const ThumbnailService = require("../services/thumbnail_service");
const FileRepository = require("../repositories/file_repository");

// Paths
const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");

// Ensure the uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const FileService = {
  // Uploads a file and stores metadata
  upload: async (filePath, parentId = null) => {
    try {
      // Ensure user is authenticated
      const userId = await getAuthenticatedUser();
      if (!userId) throw new Error(" Please login to upload a file.");

      if (!fs.existsSync(filePath)) {
        throw new Error(" File does not exist at path: " + filePath);
      }

      const stats = fs.statSync(filePath);
      const originalName = path.basename(filePath);
      // Determine MIME type and size
      const mimeType = mime.lookup(originalName) || "application/octet-stream";
      const fileSize = stats.size;

      const id = uuidv4();
      const newFilePath = path.join(UPLOAD_DIR, `${id}_${originalName}`);

      // Copy file to storage/uploads
      fs.copyFileSync(filePath, newFilePath);

      const fileMetaData = new FileMetaData({
        id,
        name: originalName,
        path: newFilePath,
        user_id: userId,
        parent_id: parentId || null,
        size: fileSize,
        mime_type: mimeType,
        visibility: "private",
        type: mimeType.startsWith("image/") ? "image" : "file",
      });

       const saved = await FileRepository.createFile(fileMetaData);
      console.log(` Uploaded: ${originalName} (${formatSize(fileSize)})`);
      console.log("File ID:", saved._id); 

      // Handle image thumbnails
        if (fileMetaData.type === "image") {
      await ThumbnailService.generate(saved._id.toString(), newFilePath);
    }
    } catch (err) {
      console.error(" Upload failed:", err.message);
    }
  },

  // Lists all uploaded files for the current user
  list: async () => {
    // Ensure user is authenticated
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("You must be logged in to view files.");
    // Retrieve files from the repository
    const files = await FileRepository.getFilesByUser(userId);

    if (!files.length) {
      console.log("📭 No files uploaded yet.");
      return;
    }

    console.log("ID         | Name       | Size   | Uploaded At");
    console.log("-----------|------------|--------|--------------------------");

    let totalSize = 0;
    for (const f of files) {
      console.log(
        `${f._id.toString().slice(0, 8)} | ${f.name.padEnd(10)} | ${f.size
          .toString()
          .padEnd(6)} | ${f.created_at.toISOString()}`
      );

      totalSize += Number(f.size); // assuming it's stored in bytes
    }

    console.log(`\n📦 Total Files: ${files.length}`);
    console.log(` Total Size: ${formatSize(totalSize)}`);
  },
  // Reads metadata of a file by its ID
  read: async (id) => {
    // Ensure user is authenticated
    const userId = await getAuthenticatedUser();
    console.log("DEBUG userId:", userId);
    if (!userId) throw new Error(" Please login to view your file.");

    // Retrieve file metadata from the repository
    const file = await FileRepository.getFileById(id, userId);
    if (!file) throw new Error(" File not found or you don't have permission.");

    console.log(` Filename: ${file.name}`);
    console.log(` Size: ${file.size}`);
    console.log(` Path: ${file.path}`);
    console.log(` Uploaded at: ${file.created_at.toISOString()}`);
  },

  // Deletes a file by its ID
delete: async (id) => {
  const userId = await getAuthenticatedUser();
  if (!userId) throw new Error("Please login to delete a file.");

  const file = await FileRepository.getFileById(id, userId);
  if (!file) throw new Error("File not found or you don't have permission.");

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  const result = await FileRepository.deleteFile(file._id, userId);
  console.log(`Deleted file: ${file.name} (${file.size})`);
  console.log("🗑️ DB deletion result:", result);
},

  // create a folder directory
  mkdir: async (folderName, parentId = null) => {
    // Ensure user is authenticated
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("Please login to create a folder");

    const id = uuidv4();
    // Check if folder already exists in the parent directory
    const exists = await FileRepository.folderExists(
      folderName,
      userId,
      parentId
    );

    if (exists)
      throw new Error(
        `Folder "${folderName}" already exists in this directory`
      );

    const folder = new FileMetaData({
      id,
      name: folderName,
      user_id: userId,
      type: "folder",
      parent_id: parentId,
      size: 0,
    });

    await FileRepository.createFile(folder);
    console.log(` Folder created: ${folderName}`);
  },

  // list all file and folder in the directory
  ls: async (parentId = null) => {
    // Ensure user is authenticated
    const userId = await getAuthenticatedUser();
    if (!userId) {
      console.log("Please login to list files.");
      return;
    }
    // Retrieve files from the repository
    const files = await FileRepository.getFilesByParent(userId, parentId);
    if (files.length === 0) {
      console.log("📭 This folder is empty.");
      return;
    }

    console.log(` Contents of folder: ${parentId}\n`);
    for (const file of files) {
      const icon =
        file.type === "folder" ? "📁" : file.type === "image" ? "🖼️" : "📄";
      const visibility =
        file.visibility === "public" ? "🌐 Public" : "🔒 Private";
      const fileId = file._id?.toString() || "❓";
      const sizeLabel = file.type === "folder" ? "-" : `${file.size} B`;

      console.log(
        `${icon} ${file.name} (${file.type}) [${fileId}] - ${visibility} - ${sizeLabel}`
      );
    }
  },
  // Publish a file to make it public
  publish: async (fileId) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("Please login first");

    // Retrieve file metadata from the repository
  const file = await FileRepository.getFileByMongoId(fileId, userId);
    if (!file) throw new Error("File not found or unauthorized");

    // Update file visibility to public
    await FileRepository.updateFileVisibility(file._id, "public");
    console.log(`🌍 File "${file.name}" is now public`);
  },
  // Unpublish a file to make it private
  unpublish: async (fileId) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("Please login first");

    // Retrieve file metadata from the repository
   const file = await FileRepository.getFileByMongoId(fileId, userId);
    if (!file) throw new Error("File not found or unauthorized");

    // Update file visibility to private
  await FileRepository.updateFileVisibility(file._id, "private");
    console.log(`🌍 File "${file.name}" is now private`);
  },
};

module.exports = FileService;
