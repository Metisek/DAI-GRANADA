import express from "express";
import nunjucks from "nunjucks";
import session from "express-session"; // importujemy express-session
import connectDB from "./model/db.js";
import ShopRouter from "./routes/route_shop.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import UserRouter from "./routes/route_users.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import Users from "./model/users.js"; // Import Users model

// Załaduj zmienne środowiskowe z pliku .env
dotenv.config();

connectDB();

const app = express();
const IN = process.env.IN || 'development';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfiguracja nunjucks
const env = nunjucks.configure('views', {
  autoescape: true,
  express: app
});

env.addFilter('capitalize', function(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

env.addFilter('sumPrices', function(cart) {
  return cart.reduce((sum, item) => sum + item.price, 0);
});

// Obsługa plików statycznych
app.use(express.static(path.join(__dirname, 'public')));
app.use('/private', express.static(path.join(__dirname, 'private')));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: IN === 'production' }
}));

const autentificacion = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      const user = await Users.findOne({ username: data.user });
      if (user) {
        req.user = { _id: user._id, username: user.username, admin: user.admin }; // Include _id in req.user
        res.locals.user = req.user; // Make user available in templates
        res.locals.isAuthenticated = true; // Set isAuthenticated to true
      } else {
        req.user = null; // User not found
        res.locals.user = null;
        res.locals.isAuthenticated = false; // Set isAuthenticated to false
      }
    } catch (err) {
      req.user = null; // Invalid token
      res.locals.user = null;
      res.locals.isAuthenticated = false; // Set isAuthenticated to false
    }
  } else {
    req.user = null; // No token
    res.locals.user = null;
    res.locals.isAuthenticated = false; // Set isAuthenticated to false
  }
  next();
};

app.use(autentificacion);

// Użycie UserRouter do obsługi tras użytkowników
app.use("/", UserRouter);
app.use("/", ShopRouter);

// Middleware do logowania błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});