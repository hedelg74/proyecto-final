import express from "express";
import controllerMantStockOut from "../controllers/controller.mant.stockout.js" 

const routerMantStockOut = express.Router();
routerMantStockOut.get("/mant-load-stockout", controllerMantStockOut.loadStockOut);
routerMantStockOut.get("/mant-load-stockout-list", controllerMantStockOut.loadStockOutList);
routerMantStockOut.post("/mant-edit-stockout", controllerMantStockOut.loadStockOutById);
routerMantStockOut.post("/mant-add-stockout", controllerMantStockOut.addStockOut);
routerMantStockOut.put("/mant-update-stockout", controllerMantStockOut.updateStockOut);
routerMantStockOut.put("/mant-update-stockout-detail-by-id", controllerMantStockOut.updateStockOutDetailById);
routerMantStockOut.delete("/mant-delete-stockout", controllerMantStockOut.deleteStockOut);
routerMantStockOut.delete("/mant-delete-stockout-detail-by-id", controllerMantStockOut.deleteStockOutDetailById);


export default routerMantStockOut;