import mongoose from "mongoose";
import Users from './users.js'; // Import the User model

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rate: { type: Number, required: true }
});

const ProductsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]/.test(v);
      },
      message: props => `${props.value} must start with an uppercase letter!`
    }
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  ratings: [RatingSchema]
});

ProductsSchema.virtual('rating.rate').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rate, 0);
  return sum / this.ratings.length;
});

ProductsSchema.virtual('rating.count').get(function() {
  return this.ratings.length;
});

const Products = mongoose.model("products", ProductsSchema);
export default Products;