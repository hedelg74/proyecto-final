import express from "express";
import controllerSetPassword from "../controllers/controller.set.password.js";

const routerSetPassword = express.Router();

routerSetPassword.post("/set-password", controllerSetPassword);

export default routerSetPassword;
