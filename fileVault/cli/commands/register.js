const AuthService = require("../../services/auth_service");

module.exports = (program) => {
  program
    .command("register")
    .description("Register a user")
    .action(async (user) => {
      try {
        const user = await AuthService.register();

        console.log("User Register successfully");
        process.exit(0);
      } catch (err) {
        console.error(err.message);}
        process.exit(1);
      }
    );
};