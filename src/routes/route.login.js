import express from "express";
import controllerLogin from "../controllers/controller.login.js";

const routerLogin = express.Router();
routerLogin.post("/login", controllerLogin.login);
routerLogin.get("/login-page", controllerLogin.renderLoginPage);

export default routerLogin;
