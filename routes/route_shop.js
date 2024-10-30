// ./routes/route_shop.js
import express from "express";
import Products from "../model/products.js";
const ShopRouter = express.Router();

ShopRouter.get('/frontpage', async (req, res)=>{
  try {
    const products = await Products.find({})   // all products
    res.render('frontpage.html', { products })    // ../views/frontpage.html,
  } catch (err) {                                // is passed {products: products}
    res.status(500).send({err})
  }
})

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

ShopRouter.get('/frontpage', async (req, res) => {
    try {
      const products = await Products.find({});
      res.render('frontpage.html', { products });
    } catch (err) {
      res.status(500).send({ err });
    }
  });


export default ShopRouter