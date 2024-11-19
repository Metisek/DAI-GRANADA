// ./model/users.js
const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false,
    required: false
  }
});

const Users = mongoose.model('Users', UsersSchema);
export default Users;