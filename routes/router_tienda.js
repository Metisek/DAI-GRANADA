// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

router.get('/portada', async (req, res)=>{
  try {
    const productos = await Productos.find({})   // todos los productos
    res.render('portada.html', { productos })    // ../views/portada.html,
  } catch (err) {                                // se le pasa { productos:productos }
    res.status(500).send({err})
  }
})

// ... más rutas aquí

export default router