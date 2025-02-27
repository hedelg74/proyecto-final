import express from "express";
import controllerProfilePage from "../controllers/controller.profile.page.js";

const routerProfilePage = express.Router();

export default routerProfilePage.get("/profile", controllerProfilePage.renderPage);
