import express from "express";
import controllerProcessOrder from "../controllers/controller.process.order.js";
import authenticateToken from "../middlewares/authenticate.token.js";

const routerProcessOrder = express.Router();
routerProcessOrder.use(authenticateToken);

routerProcessOrder.post("/process-order", controllerProcessOrder);

export default routerProcessOrder;
