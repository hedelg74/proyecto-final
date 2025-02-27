import express from "express";
import controllerSyncCart from "../controllers/controller.syncart.js";

const routerSyncCart = express.Router();
routerSyncCart.post("/sync-cart", controllerSyncCart);

export default routerSyncCart;
