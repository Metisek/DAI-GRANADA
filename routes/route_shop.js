import express from "express";
import Products from "../model/products.js";
const ShopRouter = express.Router();

// Frontpage route for the root URL "/"
ShopRouter.get('/', async (req, res) => {
  try {
    const products = await Products.find({});   // Retrieve all products
    res.render('frontpage.html', { products });  // Render the frontpage template with products
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
    res.render('product.html', { product });
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
    res.render('categories.html', { products, category });
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
    res.render("search_results.html", { products, query });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

// Trasa wyświetlania koszyka
ShopRouter.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart.html', { cart });
  });

  // Trasa dodawania produktu do koszyka
ShopRouter.post('/cart/add', async (req, res) => {
    const { productId } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Znajdź produkt po ID
    const product = await Products.findById(productId);
    if (product) {
        req.session.cart.push({
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.image  // Dodaj obrazek produktu
        });
    }

    res.redirect('/cart');
});

// Trasa usuwania produktu z koszyka
ShopRouter.post('/cart/remove', (req, res) => {
    const productId = req.body.productId;

    if (req.session.cart) {
      req.session.cart = req.session.cart.filter(item => item.productId !== productId);
    }

    res.redirect('/cart');
  });


export default ShopRouter;
