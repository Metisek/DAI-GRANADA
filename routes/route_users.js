// ./router/route_users.js
import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const UserRouter = express.Router();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourdbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Register route
UserRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new Users({ username, password: hashedPassword });;
  await newUser.save();
  res.redirect('/login');
});

// Login route
UserRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user_db = await Users.findOne({ username });
  if (user_db && await bcrypt.compare(password, user_db.password)) {
    const token = jwt.sign({ user: user_db.username, admin: user_db.admin }, process.env.SECRET_KEY);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.IN === 'production',
      sameSite: true
    }).render("home.html", { user: user_db.username });
  } else {
    res.render('login.html', { error: 'Invalid username or password' });
  }
});

// Logout route
UserRouter.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

export default UserRouter;