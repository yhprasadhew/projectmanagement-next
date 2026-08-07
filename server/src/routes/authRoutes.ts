import { Router } from "express";
import { getCurrentUser, login, register, setPassword } from "../controllers/authController.js";
import { authenticateCognitoToken } from "../middleware/cognitoAuth.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/set-password", setPassword);
router.get("/me", authenticateCognitoToken, getCurrentUser);

export default router;
