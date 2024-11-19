import express from 'express';
import Products from '../model/products';

const ProductRouter = express.Router();

ProductRouter.post('/update-product', async (req, res) => {
  const { product_id, title, price } = req.body;
  try {
    const product = await Products.findByIdAndUpdate(product_id, { title, price }, { new: true, runValidators: true });
    res.redirect(`/product/${product_id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export default ProductRouter;