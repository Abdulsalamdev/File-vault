const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { formatSize } = require('../utils/helpers');

const METADATA_PATH = path.join(__dirname, '../storage/metadata.json');
const UPLOAD_DIR = path.join(__dirname, '../storage/uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(METADATA_PATH)) fs.writeFileSync(METADATA_PATH, '[]');

const FileService = {
  upload: async (filepath) => {
    if (!fs.existsSync(filepath)) throw new Error('File does not exist');
    const stat = fs.statSync(filepath);
    const filename = path.basename(filepath);
    const id = uuidv4();
    const dest = path.join(UPLOAD_DIR, filename);
    fs.copyFileSync(filepath, dest);
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    metadata.push({
      id,
      name: filename,
      size: formatSize(stat.size),
      path: `./storage/uploads/${filename}`,
      uploadedAt: new Date().toISOString()
    });
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
    return id;
  },

  list: () => {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    console.log('ID         | Name       | Size   | Uploaded At');
    console.log('-----------|------------|--------|--------------------------');
    metadata.forEach(f => {
      console.log(`${f.id.slice(0, 8)} | ${f.name.padEnd(10)} | ${f.size.padEnd(6)} | ${f.uploadedAt}`);
    });
  },

  read: (id) => {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    const file = metadata.find(f => f.id.startsWith(id));
    if (!file) throw new Error('File not found');
    console.log(`Filename: ${file.name}`);
    console.log(`Size: ${file.size}`);
    console.log(`Path: ${file.path}`);
    console.log(`Uploaded at: ${file.uploadedAt}`);
  },

  delete: (id) => {
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH));
    const index = metadata.findIndex(f => f.id.startsWith(id));
    if (index === -1) throw new Error('File not found');
    const file = metadata[index];
    const filePath = path.join(__dirname, '../', file.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    metadata.splice(index, 1);
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
  }
};

module.exports = FileService;