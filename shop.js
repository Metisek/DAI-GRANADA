// shop.js
import express   from "express"
import nunjucks  from "nunjucks"

import connectDB from "./model/db.js"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

// 'views' directory for html templates
nunjucks.configure('views', {
  autoescape: true,
  noCache:    IN == 'development',   // true for development, no cache
  watch:      IN == 'development',   // restart with Ctrl-S
  express: app
})
app.set('view engine', 'html')

app.use(express.static('public'))     // public directory for static files

// test for the server
app.get("/hello", (req, res) => {
  res.send('Hello from the server');
});

app.get("/", (req, res) => {
  res.redirect('/frontpage');
});


// Other routes with code in the routes directory
import ShopRouter from "./routes/route_shop.js"
app.use("/", ShopRouter);



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})