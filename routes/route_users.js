import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../model/users.js'; // Importowanie modelu Users

const UserRouter = express.Router();

// Register route
UserRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new Users({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.redirect('/login?success=Account created successfully. You can now log in.');
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).render('register.html', { error: 'Error during registration. Please try again.' });
  }
});

// Login route
UserRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user_db = await Users.findOne({ username });
  if (user_db && await bcrypt.compare(password, user_db.password)) {
    const token = jwt.sign({ user: user_db.username, admin: user_db.admin }, process.env.SECRET_KEY);
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true
    });
    res.redirect('/');
  } else {
    res.render('login.html', { error: 'Invalid username or password' });
  }
});

// Logout route
UserRouter.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.redirect('/login');
});

// Check username route
UserRouter.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    const userExists = await Users.findOne({ username });
    res.json({ exists: !!userExists });
  } catch (error) {
    console.error('Check username error:', error.message);
    res.status(500).json({ error: 'Error checking username.' });
  }
});

// Check email route
UserRouter.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const emailExists = await Users.findOne({ email });
    res.json({ exists: !!emailExists });
  } catch (error) {
    console.error('Check email error:', error.message);
    res.status(500).json({ error: 'Error checking email.' });
  }
});

export default UserRouter;