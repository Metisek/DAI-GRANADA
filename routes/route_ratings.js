import express from 'express';
import Products from '../model/products.js';

const RatingsRouter = express.Router();

// GET /api/ratings - List all ratings with pagination
RatingsRouter.get('/', async (req, res) => {
  const { desde = 0, hasta = 4 } = req.query;
  try {
    const products = await Products.find({}, 'rating').skip(parseInt(desde)).limit(parseInt(hasta) - parseInt(desde) + 1);
    res.json(products);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching ratings' });
  }
});

// GET /api/ratings/:id - Get rating of a specific product
RatingsRouter.get('/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id, 'rating');
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.json(product.rating);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching rating' });
  }
});

// PUT /api/ratings/:id - Update rating of a specific product
RatingsRouter.put('/:id', async (req, res) => {
  const { rate, count } = req.body;
  try {
    const product = await Products.findByIdAndUpdate(
      req.params.id,
      { 'rating.rate': rate, 'rating.count': count },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.json(product.rating);
  } catch (err) {
    res.status(500).send({ error: 'Error updating rating' });
  }
});

export default RatingsRouter;