import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  cart: {
    type: Array,
    default: []
  }
});

const Users = mongoose.model('Users', UsersSchema);
export default Users;