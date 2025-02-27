import express from "express";
import controllerProducts from "../controllers/controller.products.js";

const routerProducts = express.Router();

// Route para servir coleccion alambre
routerProducts.get("/api/images/alambre/collares", controllerProducts.macrameCollares);
routerProducts.get("/api/images/alambre/brazaletes", controllerProducts.macrameBrazaletes);
routerProducts.get("/api/images/alambre/dijes", controllerProducts.macrameDijes);
routerProducts.get("/api/load-products", controllerProducts.loadProducts);

export default routerProducts;
