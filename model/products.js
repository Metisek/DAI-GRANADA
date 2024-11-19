// ./model/products.js
import mongoose from "mongoose";

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
    rating: {
        rate: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    }
});

const Products = mongoose.model("products", ProductsSchema);
export default Products;