import express from "express";
import controllerOrderPage from "../controllers/controller.order.page.js";
import middlewareAuthToken from "../middlewares/authenticate.token.js";

const routerOrderPage = express.Router();
routerOrderPage.use(middlewareAuthToken);

routerOrderPage.get("/order", controllerOrderPage.renderOrderPage);

export default routerOrderPage;
