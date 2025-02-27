import express from "express";
import controllerMantStockIn from "../controllers/controller.mant.stockin.js"; 

const routerMantStockIn = express.Router();
routerMantStockIn.get("/mant-load-stockin", controllerMantStockIn.loadStockIn);
routerMantStockIn.get("/mant-load-stockin-list", controllerMantStockIn.loadStockInList);
routerMantStockIn.post("/mant-edit-stockin", controllerMantStockIn.loadStockInById);
routerMantStockIn.post("/mant-add-stockin", controllerMantStockIn.addStockIn);
routerMantStockIn.put("/mant-update-stockin", controllerMantStockIn.updateStockIn);
routerMantStockIn.put("/mant-update-stockin-detail-by-id", controllerMantStockIn.updateStockInDetailById);
routerMantStockIn.delete("/mant-delete-stockin", controllerMantStockIn.deleteStockIn);
routerMantStockIn.delete("/mant-delete-stockin-detail-by-id", controllerMantStockIn.deleteStockInDetailById);


export default routerMantStockIn;