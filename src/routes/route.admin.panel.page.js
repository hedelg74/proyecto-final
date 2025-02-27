import express from "express";
import controllerAdminPanelPage from "../controllers/contoller.admin.panel.page.js";
//import middlewareAuthToken from "../middlewares/authenticate.token.js";

const routerAdminPanelPage = express.Router();
//routerOrderPage.use(middlewareAuthToken);

routerAdminPanelPage.get("/admin-panel", controllerAdminPanelPage.renderAdminPanelPage);

export default routerAdminPanelPage;
