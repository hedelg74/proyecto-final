import express from "express";
import controllerAuth from "../controllers/controller.auth.js";

const routerAuth = express.Router();

routerAuth.get("/auth", controllerAuth);

export default routerAuth;
