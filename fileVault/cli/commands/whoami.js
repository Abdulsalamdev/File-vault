const AuthService = require("../../services/auth_service");

module.exports = (program) => {
  program
 .command("whoami")
    .description("Show current logged-in user")
    .action(async (user) => {
      try {
        const user = await AuthService.whoami()
        process.exit(0);
      } catch (err) {
        console.error(err.message);}
        process.exit(1);
      }
    );
};