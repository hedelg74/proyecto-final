import express from "express";
import controllerResetPassword from "../controllers/controller.reset.password.js";

const routerResetPassword = express.Router();

routerResetPassword.get("/reset-password", controllerResetPassword);

export default routerResetPassword;
