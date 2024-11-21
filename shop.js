import express from "express";
import nunjucks from "nunjucks";
import session from "express-session"; // importujemy express-session
import connectDB from "./model/db.js";
import ShopRouter from "./routes/route_shop.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import UserRouter from "./routes/route_users.js";
import dotenv from "dotenv";

// Załaduj zmienne środowiskowe z pliku .env
dotenv.config();

connectDB();

const app = express();
const IN = process.env.IN || 'development';

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

// Obsługa plików statycznych
app.use(express.static('public'));

const autentificacion = (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.username = data.user; // Zalogowany użytkownik
    } catch (err) {
      req.username = null; // Niepoprawny token
    }
  } else {
    req.username = null; // Brak tokenu
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
  console.log(`Server is running on port ${PORT}`);
});