const uploadCmd = require('./commands/upload');
const listCmd = require('./commands/list');
const readCmd = require('./commands/read');
const deleteCmd = require('./commands/delete');
module.exports = (program) => {
  uploadCmd(program);
  listCmd(program);
  readCmd(program);
  deleteCmd(program);
};
