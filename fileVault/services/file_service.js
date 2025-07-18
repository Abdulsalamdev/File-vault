const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { formatSize } = require("../utils/helpers");
const { getAuthenticatedUser } = require("../utils/auth");
const FileMetaData = require("../models/file");
const mime = require("mime-types");

// Paths
const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");

// Ensure the uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const FileService = {
  // Uploads a file and stores metadata
  upload: async (filePath, parentId = null) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("Please login to upload a file");

    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    const originalName = path.basename(filePath);
    const mimeType = mime.lookup(originalName) || "application/octet-stream";

    const id = uuidv4(); // ✅ ADD THIS

    const newFile = new FileMetaData({
      id, // ✅ REQUIRED FIELD
      name: originalName,
      user_id: userId,
      type: "file",
      parent_id: parentId,
      size: `${(stats.size / 1024).toFixed(1)} KB`,
      mime_type: mimeType,
      content: fileBuffer,
    });

    await newFile.save();
    console.log(`📤 Uploaded: ${originalName}`);
  },
  // Lists all uploaded files for the current user
  list: async () => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("You must be logged in to upload a file.");

    const files = await FileMetaData.find({ user_id: userId }).sort({
      created_at: -1,
    });

    if (!files.length) {
      console.log("📭 No files uploaded yet.");
      return;
    }

    console.log("ID         | Name       | Size   | Uploaded At");
    console.log("-----------|------------|--------|--------------------------");

    let totalSize = 0;
    for (const f of files) {
      console.log(
        `${f.id.slice(0, 8)} | ${f.name.padEnd(10)} | ${f.size.padEnd(
          6
        )} | ${f.created_at.toISOString()}`
      );
      const numericSize = parseFloat(f.size);
      const sizeInBytes = f.size.includes("MB")
        ? numericSize * 1024 * 1024
        : f.size.includes("KB")
        ? numericSize * 1024
        : numericSize;
      totalSize += sizeInBytes;
    }

    console.log(`\n📦 Total Files: ${files.length}`);
    console.log(`🧮 Total Size: ${formatSize(totalSize)}`);
  },
  // Reads metadata of a file by its ID
  read: async (id) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error(" Please login to view your file.");

    const file = await FileMetaData.findOne({
      id: new RegExp(`^${id}`),
      user_id: userId,
    });

    if (!file) throw new Error(" File not found or you don't have permission.");

    console.log(` Filename: ${file.name}`);
    console.log(` Size: ${file.size}`);
    console.log(` Path: ${file.path}`);
    console.log(` Uploaded at: ${file.created_at.toISOString()}`);
  },

  // Deletes a file by its ID
  delete: async (id) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error(" Please login to delete a file.");

    const file = await FileMetaData.findOne({
      id: new RegExp(`^${id}`),
      user_id: userId,
    });

    if (!file) throw new Error(" File not found or you don't have permission.");

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    await FileMetaData.deleteOne({ _id: file._id });

    console.log(`🗑️ Deleted file: ${file.name} (${file.size})`);
  },

// create a folder directory
mkdir: async (folderName, parentId = null) => {
  const userId = await getAuthenticatedUser();
  if (!userId) throw new Error("Please login to create a folder");

  const id = uuidv4();

  const exists = await FileMetaData.findOne({
    name: folderName,
    user_id: userId,
    parent_id: parentId,
    type: "folder",
  });

  if (exists)
    throw new Error(`Folder "${folderName}" already exists in this directory`);

  const folder = new FileMetaData({
    id,
    name: folderName, // ✅ add this!
    user_id: userId,
    type: "folder",
    parent_id: parentId,
    size: "0 B", // optional: folders don't have real size
  });

  await folder.save();
  console.log(`📁 Folder created: ${folderName}`);
},


  // list all file and folder in the directory
  ls: async (parentId = null) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("Please login to list files.");

    const files = await FileMetaData.find({
      user_id: userId,
      parent_id: parentId,
    }).sort({ type: 1, name: 1 }); // folders first, then files alphabetically

    if (files.length === 0) {
      console.log("📁 This folder is empty.");
      return;
    }

    console.log(`📂 Contents of folder: ${parentId || 'root'}\n`);
    files.forEach((file) => {
      const icon = file.type === "folder" ? "📁" : "📄";
      console.log(`${icon} ${file.name} (${file.type}) [${file._id}] - ${file.is_public ? "🌐 Public" : "🔒 Private"} - ${file.size || "0 B"}`);
    });
  },
};

module.exports = FileService;
