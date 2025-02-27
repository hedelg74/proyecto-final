import express from "express";
import controllerHomePage from "../controllers/controller.home.page.js";

const routerHomePage = express.Router();

// Route para servir index.html en la raíz del servidor
export default routerHomePage.get("/", controllerHomePage.renderHomePage);
