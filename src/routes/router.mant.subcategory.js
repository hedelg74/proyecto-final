import express from "express";
import controllerMantSubCategory from "../controllers/controller.mant.subcategory.js"; 

const routerMantSubCategory = express.Router();
routerMantSubCategory.get("/mant-load-subcategory", controllerMantSubCategory.loadSubCategory);
routerMantSubCategory.get("/mant-load-subcategory-list", controllerMantSubCategory.loadSubCategoryList);
routerMantSubCategory.post("/mant-edit-subcategory", controllerMantSubCategory.loadSubCategoryById);
routerMantSubCategory.post("/mant-add-subcategory", controllerMantSubCategory.addSubCategory);
routerMantSubCategory.put("/mant-update-subcategory", controllerMantSubCategory.updateSubCategory);
routerMantSubCategory.delete("/mant-delete-subcategory", controllerMantSubCategory.deleteSubCategory);

export default routerMantSubCategory;