import express from "express";
import controllerUser from "../controllers/controller.user.js";

const routerUser = express.Router();

routerUser.put("/users/profile", controllerUser.updatePersonalData);
routerUser.put("/users/password", controllerUser.updatePassword);
routerUser.get("/users/personal-data", controllerUser.loadPersonalData);

routerUser.get("/mant-load-users", controllerUser.loadUserList);
routerUser.post("/mant-edit-user", controllerUser.loadUserById);
routerUser.put("/mant-update-user", controllerUser.updateUser);
routerUser.post("/mant-add-user", controllerUser.addUser);
routerUser.delete("/mant-delete-user", controllerUser.deleteUser);



export default routerUser;
