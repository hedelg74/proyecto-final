import express from "express";
import controllerForgotPassword from "../controllers/controller.forgot.password.js";

const routerForgotPassword = express.Router();

routerForgotPassword.post("/forgot-password", controllerForgotPassword);

export default routerForgotPassword;
