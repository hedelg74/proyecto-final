import express from "express";
import controllerLogOut from "../controllers/controller.logout.js";
const routerLogOut = express.Router();

routerLogOut.post("/logout", controllerLogOut);
export default routerLogOut;
