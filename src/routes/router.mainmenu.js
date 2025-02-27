import express from "express";
import controllerMainMenu from "../controllers/controller.mainmenu.js";

const routerMainMenu = express.Router();
routerMainMenu.get("/main-menu", controllerMainMenu.renderMainMenu);

export default routerMainMenu;
