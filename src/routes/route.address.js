import express from "express";
import controllerAddress from "../controllers/controller.address.js";

const routerAddress = express.Router();

routerAddress.get("/user/load-address", controllerAddress.loadAddress);
routerAddress.post("/user/add-address", controllerAddress.addAddress);
routerAddress.put("/user/update-address", controllerAddress.updateAddress);

export default routerAddress;
