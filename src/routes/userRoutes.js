import { Router } from "express";
const router = Router();
import userController from "../controllers/userController.js";

router.get("/", userController.getUser);

router.post("/", userController.createUser);

router.put("/", userController.updateUser);

router.post("/login", userController.login);

router.post("/refreshToken", userController.refreshToken);

export default router;
