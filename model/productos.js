// ./model/productos.js
import mongoose from "mongoose";

const ProductosSchema = new mongoose.Schema({
  "id": {
    "type": "Number",
    "unique": true
  },
  "name": {
    "type": "String",
    "required": true
  },
  "price": {
    "type": "Number",
    "required": true
  }
});
const Productos = mongoose.model("productos", ProductosSchema);
export default Productos