const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { formatSize } = require("../utils/helpers");

// metaData and Uplaod path Handler
const METADATA_PATH = path.join(__dirname, "../storage/metadata.json");
const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");

// Ensure the uploads folder and metadata file exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(METADATA_PATH)) fs.writeFileSync(METADATA_PATH, "[]");

//File Service Handler
const FileService = {
  // Uploads a file and stores metadata
  upload: async (filepath) => {
    if (!fs.existsSync(filepath)) throw new Error("File does not exist");
    const stat = fs.statSync(filepath);
    const filename = path.basename(filepath);
    const ext = path.extname(filename).toLowerCase();
    const id = uuidv4();
    const dest = path.join(UPLOAD_DIR, filename);

    //File Type validataion
    const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh"];
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      throw new Error(`File type "${ext}" is not allowed`);
    }

    // Copy file to uploads folder
    fs.copyFileSync(filepath, dest);

    // Read existing metadata
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));

    // Add new file's metadata
    metadata.push({
      id,
      name: filename,
      size: formatSize(stat.size),
      path: `./storage/uploads/${filename}`,
      uploadedAt: new Date().toISOString(),
    });

    //Save updated metadata
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
    return id;
  },

  // Lists all uploaded files
  list: () => {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    console.log("ID         | Name       | Size   | Uploaded At");
    console.log("-----------|------------|--------|--------------------------");
    metadata.forEach((f) => {
      console.log(
        `${f.id.slice(0, 8)} | ${f.name.padEnd(10)} | ${f.size.padEnd(6)} | ${
          f.uploadedAt
        }`
      );
    });
  },

  // Reads a file’s metadata by ID
  read: (id) => {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    const file = metadata.find((f) => f.id.startsWith(id));
    if (!file) throw new Error("File not found");
    console.log(`Filename: ${file.name}`);
    console.log(`Size: ${file.size}`);
    console.log(`Path: ${file.path}`);
    console.log(`Uploaded at: ${file.uploadedAt}`);
  },

  // Delete a a file and its metadata
  delete: (id) => {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    const index = metadata.findIndex((f) => f.id.startsWith(id));
    if (index === -1) throw new Error("File not found");
    const file = metadata[index];
    const filePath = path.join(__dirname, "../", file.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    metadata.splice(index, 1);
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
  },
};

module.exports = FileService;
