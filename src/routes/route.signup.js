import express from "express";
import controllerSignUp from "../controllers/controller.signup.js";
import validateUserAccount from "../middlewares/validate.user.account.js";

const routerSignUp = express.Router();

routerSignUp.post("/signup", validateUserAccount, controllerSignUp.registerUserAccount);

export default routerSignUp;
