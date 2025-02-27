import express from "express";
import controllerEmptyCartPage from "../controllers/controller.emptycart.page.js";

const routerEmptyCartPage = express.Router();


export default routerEmptyCartPage.get("/empty-cart", controllerEmptyCartPage.renderEmptyCartPage);
