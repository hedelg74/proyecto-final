import express from "express";
import controllerConfigAccount from "../controllers/controller.config.account.js";

const routerConfigAccount = express.Router();

routerConfigAccount.put("/config-account", controllerConfigAccount);

export default routerConfigAccount;
