const uploadCmd = require('./commands/upload');
const listCmd = require('./commands/list');
const readCmd = require('./commands/read');
const deleteCmd = require('./commands/delete');
const registerCmd = require('./commands/register')
const loginCmd = require('./commands/login');
const logoutCmd = require('./commands/logout');
const whoamiCmd = require('./commands/whoami');
module.exports = (program) => {
  uploadCmd(program);
  listCmd(program);
  readCmd(program);
  deleteCmd(program);
registerCmd(program)
loginCmd(program);
  logoutCmd(program);
  whoamiCmd(program);}