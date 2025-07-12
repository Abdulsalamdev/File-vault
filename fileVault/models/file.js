const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  name: String,
  path: String,
  size: String,
  created_at: { type: Date, default: Date.now }
});

const FileMetaData = mongoose.model('FileMetaData', fileSchema);
module.exports = FileMetaData;