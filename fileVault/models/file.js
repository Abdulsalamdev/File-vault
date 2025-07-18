const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema( {
   id: {
    type: String,
    unique: true,
    required: true,
  },
    name: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      default: null, // folders won't have a real path
    },

    size: {
      type: Number,
      default: 0,
    },

    mime_type: {
      type: String,
      default: "application/octet-stream",
    },

    type: {
      type: String,
      enum: ["file", "folder", "image"],
      required: true,
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileMetaData",
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

const FileMetaData = mongoose.model('FileMetaData', fileSchema);
module.exports = FileMetaData;

