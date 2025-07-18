const uploadCmd = require('./commands/upload');
const listCmd = require('./commands/list');
const readCmd = require('./commands/read');
const deleteCmd = require('./commands/delete');
const registerCmd = require('./commands/register')
const loginCmd = require('./commands/login');
const logoutCmd = require('./commands/logout');
const whoamiCmd = require('./commands/whoami');
const lsCmd = require('./commands/ls');
const mkdirCmd = require('./commands/mkdir');
const publishCmd = require('./commands/publish');
const unpublishCmd = require('./commands/unpublish');
module.exports = (program) => {
  uploadCmd(program);
  listCmd(program);
  readCmd(program);
  deleteCmd(program);
registerCmd(program)
loginCmd(program);
  logoutCmd(program);
  lsCmd(program);
  mkdirCmd(program);
  publishCmd(program);
  unpublishCmd(program);
  whoamiCmd(program);}