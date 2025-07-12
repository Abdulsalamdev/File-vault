const AuthService = require("../../services/auth_service");

module.exports = (program) => {
  program
    .command("login")
    .description("Login a user")
    .action(async (user) => {
      try {
        const user = await AuthService.login();
        process.exit(0);
      } catch (err) {
        console.error(err.message);}
        process.exit(1);
      }
    );
};