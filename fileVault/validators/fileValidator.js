const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
});

exports.createFileSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  type: Joi.string().valid("file", "folder", "image").required(),
  parentId: objectId.allow(null, ""),
  visibility: Joi.string().valid("private", "public").optional(),
});

exports.getFileByIdSchema = Joi.object({
  id: objectId.required(),
});
