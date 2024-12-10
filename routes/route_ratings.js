// route_ratings.js
import express from 'express';
import Products from '../model/products.js';
import { isAuthenticated } from '../middleware/auth.js';

const RatingsRouter = express.Router();

// GET /api/ratings/user/:productId - Get user rating for a specific product
RatingsRouter.get('/user/:productId', isAuthenticated, async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized user.' });
  }
  try {
    const product = await Products.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const userRating = product.ratings.find(rating => rating.user.equals(userId));
    res.json({ userRating: userRating || null });
  } catch (err) {
    console.error('Error fetching user rating:', err);
    res.status(500).json({ error: 'Error fetching user rating.' });
  }
});

// PUT /api/ratings/:id - Update rating of a specific product
RatingsRouter.put('/:id', isAuthenticated, async (req, res) => {
  const { rate } = req.body;
  const userId = req.user?._id;

  if (!rate || typeof rate !== 'number' || rate < 1 || rate > 5) {
    return res.status(400).json({ error: 'Invalid rating value.' });
  }
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized user.' });
  }

  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const existingRating = product.ratings.find(rating => rating.user.equals(userId));
    if (existingRating) {
      existingRating.rate = rate;
    } else {
      product.ratings.push({ user: userId, rate });
    }

    await product.save();

    const updatedRating = product.ratings.reduce((acc, r) => acc + r.rate, 0) / product.ratings.length;

    res.json({
      rate: updatedRating.toFixed(2),
      count: product.ratings.length,
    });
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ error: 'Error updating rating.' });
  }
});

// PUT /api/ratings/reset - Reset all ratings for all products
RatingsRouter.put('/reset', async (req, res) => {
  try {
    await Products.updateMany({}, { $set: { ratings: [] } });
    res.send({ message: 'All ratings have been reset.' });
  } catch (err) {
    console.error('Error resetting ratings:', err);
    res.status(500).send({ error: 'Error resetting ratings' });
  }
});

// GET /api/ratings - List all ratings with pagination
RatingsRouter.get('/', async (req, res) => {
  const { desde = 0, hasta = 4 } = req.query;
  try {
    const products = await Products.find({}, 'rating').skip(parseInt(desde)).limit(parseInt(hasta) - parseInt(desde) + 1);
    res.json(products);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).send({ error: 'Error fetching ratings' });
  }
});

// GET /api/ratings/:id - Get rating of a specific product
RatingsRouter.get('/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id).populate('ratings.user', 'username');
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.json({
      rate: product.rating.rate,
      count: product.rating.count,
      ratings: product.ratings
    });
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).send({ error: 'Error fetching rating' });
  }
});

// PUT /api/ratings/admin/:id - Admin update rating of a specific product
RatingsRouter.put('/admin/:id', async (req, res) => {
  if (req.hostname !== 'localhost') {
    return res.status(403).send({ error: 'Forbidden: Admin access only from localhost' });
  }

  const { rate, userId } = req.body;

  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    // Check if the user has already rated this product
    const existingRating = product.ratings.find(rating => rating.user.equals(userId));
    if (existingRating) {
      existingRating.rate = rate;
    } else {
      product.ratings.push({ user: userId, rate });
    }

    await product.save();
    res.json({
      rate: product.rating.rate,
      count: product.rating.count
    });
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).send({ error: 'Error updating rating' });
  }
});

// Po
RatingsRouter.delete('/:id', isAuthenticated, async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized user.' });
  }

  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const initialCount = product.ratings.length;

    product.ratings = product.ratings.filter(rating => !rating.user.equals(userId));

    if (product.ratings.length === initialCount) {
      return res.status(404).json({ error: 'Rating not found for this user.' });
    }

    await product.save();
    res.json({ success: true, message: 'Rating deleted.' });
  } catch (err) {
    console.error('Error deleting rating:', err);
    res.status(500).json({ error: 'Error deleting rating.' });
  }
});

export default RatingsRouter;