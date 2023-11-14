import express from "express";
import authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

//http://localhost:3010/role/auth
//login
router.post('/login', authController.login)
//register
router.post('/register', authController.register)
//get me
router.get('/me', authMiddleware ,authController.getMe)
//refresh token
router.post('/refresh', authController.requestRefreshToken)
//logout
router.post('/logout', authMiddleware ,authController.logout)


export default router;