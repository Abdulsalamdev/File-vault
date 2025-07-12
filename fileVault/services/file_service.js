const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { formatSize } = require("../utils/helpers");
const { getAuthenticatedUser } = require("../utils/auth");
const FileMetaData = require("../models/file");

// Paths
const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");

// Ensure the uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const FileService = {
  // Uploads a file and stores metadata
  upload: async (filepath) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("You must be logged in to upload a file.");

    if (!fs.existsSync(filepath)) throw new Error("❌ File does not exist.");

    const stat = fs.statSync(filepath);
    const filename = path.basename(filepath);
    const ext = path.extname(filename).toLowerCase();
    const id = uuidv4();
    const dest = path.join(UPLOAD_DIR, filename);

    // File type validation
    const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh"];
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      throw new Error(` File type "${ext}" is not allowed.`);
    }

    // Check for duplicate file name by same user
    const exists = await FileMetaData.findOne({ name: filename, user_id: userId });
    if (exists) {
      throw new Error(`A file named "${filename}" already exists.`);
    }

    // Copy file to uploads folder
    fs.copyFileSync(filepath, dest);

    // Save metadata to MongoDB
    const newFile = new FileMetaData({
      id,
      user_id: userId,
      name: filename,
      path: dest,
      size: formatSize(stat.size),
    });

    await newFile.save();

    console.log(" File uploaded and saved to DB.");
    return id;
  },

  // Lists all uploaded files for the current user
list: async () => {
  const userId = await getAuthenticatedUser();
  console.log("🔐 Authenticated User ID:", userId);

  if (!userId) {
    console.log("Please login to list your files.");
    return;
  }

  const files = await FileMetaData.find({ user_id: userId }).sort({ created_at: -1 });
  console.log("Files fetched from DB:", files); 

  if (!files.length) {
    console.log("📭 No files uploaded yet.");
    return;
  }

  console.log("ID         | Name       | Size   | Uploaded At");
  console.log("-----------|------------|--------|--------------------------");

  let totalSize = 0;

  files.forEach((f) => {
    console.log(
      `${f.id.slice(0, 8)} | ${f.name.padEnd(10)} | ${f.size.padEnd(6)} | ${f.created_at.toISOString()}`
    );

    const sizeInBytes = parseFloat(f.size) * (f.size.includes("MB")
      ? 1024 * 1024
      : f.size.includes("KB")
      ? 1024
      : 1);
    totalSize += sizeInBytes;
  });

  console.log(`\n📁 Total Files: ${files.length}`);
  console.log(`📦 Total Size: ${formatSize(totalSize)}`);
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

    console.log(`Filename: ${file.name}`);
    console.log(`Size: ${file.size}`);
    console.log(`Path: ${file.path}`);
    console.log(`Uploaded at: ${file.created_at.toISOString()}`);
  },

  // Deletes a file by its ID
  delete: async (id) => {
    const userId = await getAuthenticatedUser();
    if (!userId) throw new Error("Please login to delete a file.");

    const file = await FileMetaData.findOne({
      id: new RegExp(`^${id}`),
      user_id: userId,
    });

    if (!file) throw new Error(" File not found or you don't have permission.");

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    await FileMetaData.deleteOne({ _id: file._id });

    console.log(` Deleted file: ${file.name} (${file.size})`);
  },
};

module.exports = FileService;
