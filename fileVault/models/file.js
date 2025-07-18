const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
 id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  user_id: { type: String, required: true },
  type: { type: String, enum: ['file', 'folder', 'image'], required: true },
  size: { type: String },
  parent_id: { type: String, default: null },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  created_at: { type: Date, default: Date.now }
});

const FileMetaData = mongoose.model('FileMetaData', fileSchema);
module.exports = FileMetaData;