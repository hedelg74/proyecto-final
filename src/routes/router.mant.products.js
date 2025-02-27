import express from "express";
import controllerMantProducts from "../controllers/controller.mant.products.js"; 
import uploadFile from "../middlewares/upload.file.js";

const routerMantProducts = express.Router();
routerMantProducts.get("/mant-load-products", controllerMantProducts.loadProduct);
routerMantProducts.get("/mant-load-products-list", controllerMantProducts.loadProductList);
routerMantProducts.post("/mant-edit-product", controllerMantProducts.loadProductById);
routerMantProducts.post("/mant-qr-code", controllerMantProducts.loadProductByQr);
routerMantProducts.post("/mant-add-product", uploadFile, controllerMantProducts.addProduct);
routerMantProducts.put("/mant-update-product", controllerMantProducts.updateProduct);
routerMantProducts.delete("/mant-delete-product", controllerMantProducts.deleteProduct);
routerMantProducts.get("/mant-gen-qr", controllerMantProducts.genQrCode);


export default routerMantProducts;
