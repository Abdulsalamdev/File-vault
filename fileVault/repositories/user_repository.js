const { User } = require("../models/user");

// create a user repository to handle user-related database operations
const UserRepository = {
  findByEmail: (email) => User.findOne({ email }),
  findById: (id) => User.findById(id),
  create: (userData) => {
    const user = new User(userData);
    return user.save();
  },
};

module.exports = UserRepository;


