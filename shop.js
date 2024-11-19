import express from "express";
import nunjucks from "nunjucks";
import session from "express-session"; // importujemy express-session
import connectDB from "./model/db.js";
import ShopRouter from "./routes/route_shop.js";
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

connectDB();

const app = express();
const IN = process.env.IN || 'development';

app.use(cookieParser())

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
      req.username = null; // Brak tokena = niezalogowany użytkownik
  }
  next();
};

app.use(autentificacion)

nunjucks.configure('views', {
  autoescape: true,
  noCache: IN === 'development',
  watch: IN === 'development',
  express: app
});
app.set('view engine', 'html');

// Konfiguracja sesji
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: IN !== 'development' } // secure cookies in production
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Test dla serwera
app.get("/hello", (req, res) => {
  res.send('Hello from the server');
});

// Użycie ShopRouter do obsługi routingu
app.use("/", ShopRouter);

nunjucks.configure('views', {
  autoescape: true,
  noCache: IN === 'development',
  watch: IN === 'development',
  express: app
}).addFilter('sumPrices', (cart) => {
  return cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

