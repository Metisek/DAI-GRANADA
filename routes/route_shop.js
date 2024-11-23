import express from "express";
import Products from "../model/products.js";
import Users from "../model/users.js"; // Import Users model
const ShopRouter = express.Router();

// Frontpage route for the root URL "/"
ShopRouter.get('/', async (req, res) => {
  try {
    const products = await Products.find({});   // Retrieve all products
    res.render('frontpage.html', { products, user: req.user });  // Render the frontpage template with products
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Route to get a specific product by ID
ShopRouter.get('/product/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.render('product.html', { product, user: req.user });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Route to create a new product
ShopRouter.post('/product', async (req, res) => {
  try {
    const newProduct = new Products(req.body);
    await newProduct.save();
    res.status(201).send(newProduct);
  } catch (err) {
    res.status(400).send({ err });
  }
});

// Route to update a product by ID
ShopRouter.put('/product/:id', async (req, res) => {
  try {
    const updatedProduct = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send(updatedProduct);
  } catch (err) {
    res.status(400).send({ err });
  }
});

// Route to delete a product by ID
ShopRouter.delete('/product/:id', async (req, res) => {
  try {
    const deletedProduct = await Products.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Route to fetch products by category
ShopRouter.get('/categories/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Products.find({ category });
    res.render('categories.html', { products, category, user: req.user });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Route to fetch unique categories
ShopRouter.get('/categories', async (req, res) => {
  try {
    const categories = await Products.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Product search route
ShopRouter.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const products = await Products.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });
    res.render("search_results.html", { products, query, user: req.user });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

// Trasa wyświetlania koszyka
ShopRouter.get('/cart', async (req, res) => {
  let cart = [];
  if (req.user) {
    const user = await Users.findById(req.user._id);
    if (user) {
      cart = user.cart;
    }
  } else {
    cart = req.session.cart || [];
  }
  console.log('Cart:', cart); // Debug statement
  res.render('cart.html', { cart, user: req.user || "Guest" });
});

// Trasa dodawania produktu do koszyka
ShopRouter.post('/cart/add', async (req, res) => {
  const { productId } = req.body;
  console.log('Product ID:', productId); // Debug statement

  const product = await Products.findById(productId);
  console.log('Product:', product); // Debug statement

  if (product) {
    const cartItem = {
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.image
    };

    if (req.user) {
      const user = await Users.findById(req.user._id);
      console.log('User:', user); // Debug statement

      if (user) {
        user.cart.push(cartItem);
        await user.save();
        console.log('Updated User Cart:', user.cart); // Debug statement
      } else {
        console.error('User not found'); // Debug statement
      }
    } else {
      if (!req.session.cart) {
        req.session.cart = [];
      }
      req.session.cart.push(cartItem);
    }
  } else {
    console.error('Product not found'); // Debug statement
  }

  res.redirect('/cart');
});

// Trasa usuwania produktu z koszyka
ShopRouter.post('/cart/remove', async (req, res) => {
  const productId = req.body.productId;
  console.log('Product ID to remove:', productId); // Debug statement

  if (req.user) {
    const user = await Users.findById(req.user._id);
    console.log('User:', user); // Debug statement

    if (user) {
      user.cart = user.cart.filter(item => item.productId.toString() !== productId);
      await user.save();
      console.log('Updated User Cart:', user.cart); // Debug statement
    } else {
      console.error('User not found'); // Debug statement
    }
  } else {
    if (req.session.cart) {
      req.session.cart = req.session.cart.filter(item => item.productId !== productId);
    }
  }

  res.redirect('/cart');
});

// Trasa do logowania
ShopRouter.get('/login', (req, res) => {
  res.render('login.html'); // Renderowanie szablonu login.html
});

// Trasa do rejestracji
ShopRouter.get('/register', (req, res) => {
  res.render('register.html'); // Renderowanie szablonu register.html
});

// Trasa wylogowania
ShopRouter.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  req.session.cart = [];
  res.render("login.html", { user: req.user });
});

ShopRouter.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.user; // Sprawdzenie, czy użytkownik jest zalogowany
  next();
});

ShopRouter.get('/header', (req, res) => {
  res.render('resources/header.html'); // Renderowanie dynamicznego nagłówka
});

// Obsługa logowania
ShopRouter.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Weryfikacja użytkownika (przykład - wymaga bazy danych)
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ user: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.cookie('access_token', token, { httpOnly: true });
    return res.redirect('/');
  } else {
    return res.status(401).render('login.html', { error: 'Invalid username or password.' });
  }
});

// Obsługa rejestracji
ShopRouter.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  // Przykład prostego zapisu do bazy (powinien być rozbudowany o hashowanie hasła)
  try {
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return res.status(400).render('register.html', { error: 'Username already exists.' });
    }

    const newUser = new Users({ username, password, email });
    await newUser.save();
    return res.render('register.html', { success: 'Registration successful. You can now log in.' });
  } catch (err) {
    return res.status(500).render('register.html', { error: 'Error during registration. Please try again.' });
  }
});

export default ShopRouter;