const { User } = require("../models/user");
const readlineSync = require("readline-sync");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const redis = require("../storage/redis_client");
const fs = require('fs');
const path = require('path');
const sessionPath = path.join(process.cwd(), '.session');
const UserRepository = require("../repositories/user_repository");
const SessionRepository = require("../repositories/session_repository");

const AuthService = {
  register: async () => {
    const email = readlineSync.question("nter your email: ");
    const password = readlineSync.question("Enter your password: ", {
      hideEchoBack: true,
    });

    // Check if user already exists
   const user = await UserRepository.findByEmail(email);
    if (user) throw new Error("User Already Exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword});
    await newUser.save();
  },

  login: async () => {
    const email = readlineSync.question("Enter your email: ");
    const password = readlineSync.question("Enter your password: ", {
      hideEchoBack: true,
    });

    // Find the user by email
   const user = await UserRepository.findByEmail(email);
    if (!user) {
      console.log(" User not found.");
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password.");
      return;
    }

    // Generate a session token
    const token = uuidv4();

    // Save session in Redis
    await SessionRepository.set(token, user._id.toString());

    // Save token locally in `.session`
    fs.writeFileSync(sessionPath, token);

    console.log("Login successful!");
    console.log(`Your session token: ${token}`);
  },

  logout: async () => {
    if (!fs.existsSync(sessionPath)) {
      console.log("No session found.");
      return;
    }

    const token = fs.readFileSync(sessionPath, 'utf-8');
    await SessionRepository.del(token);
    fs.unlinkSync(sessionPath);

    console.log("Logged out successfully.");
  },

  whoami: async () => {
    if (!fs.existsSync(sessionPath)) {
      console.log("No active session.");
      return;
    }

    const token = fs.readFileSync(sessionPath, 'utf-8');
    const userId = await SessionRepository.get(token);
    if (!userId) {
      console.log(" Session expired or invalid.");
      return;
    }

     const user = await UserRepository.findById(userId);
    if (!user) {
      console.log(" User not found.");
      return;
    }

    console.log("👤 Logged in as:", user.email);
  }
};

module.exports = AuthService;