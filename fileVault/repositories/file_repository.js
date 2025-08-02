const FileMetaData = require("../models/file");
const mongoose = require("mongoose");

const FileRepository = {
  // Create a new file entry in the database
  async createFile(fileData) {
    const file = new FileMetaData(fileData);
    return await file.save();
  },
  // Retrieve a file by its ID and user ID
async getFileById(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }
  return await FileMetaData.findOne({ _id: id, user_id: userId });
},
  
  // Get all publicly visible files (optionally within a specific parent folder)
async getPublicFiles(parentId = null) {
  return await FileMetaData.find({
    visibility: "public",
    parent_id: parentId,
  }).sort({ created_at: -1 });
},

  // Retrieve a file by its MongoDB ID and user ID
  async getFileByMongoId(_id, userId) {
    return await FileMetaData.findOne({
      _id: new mongoose.Types.ObjectId(_id),
      user_id: userId,
    });
  },
  // Retrieve all files for a user, sorted by creation date
  async getFilesByUser(userId) {
    return await FileMetaData.find({ user_id: userId }).sort({
      created_at: -1,
    });
  },
  // Retrieve all files in a specific folder for a user
  async getFilesByParent(userId, parentId) {
    return await FileMetaData.find({
      user_id: userId,
      parent_id: parentId,
    }).sort({ created_at: -1 });
  },
  // Check if a file with the same name exists in a specific folder for a user
  async folderExists(name, userId, parentId) {
    return await FileMetaData.findOne({
      name,
      user_id: userId,
      parent_id: parentId,
      type: "folder",
    });
  },
  // delete a file's metadata
async deleteFile(_id) {
  return await FileMetaData.deleteOne({ _id });
},
  // Update a file's metadata
  async updateFileVisibility(_id, visibility) {
    return await FileMetaData.updateOne({ _id }, { $set: { visibility } });
  },
};

module.exports = FileRepository;
