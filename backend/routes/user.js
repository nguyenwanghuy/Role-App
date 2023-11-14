import express from "express";
import userController from "../controllers/userController.js";
import { authMiddleware, verifyTokenAndAdmins } from "../middlewares/auth.middleware.js";
const router = express.Router();
//http://localhost:3010/role/user
 router.get('/',authMiddleware, userController.getAllUsers)
router.delete('/:id',verifyTokenAndAdmins, userController.deleteUser)
export default router;