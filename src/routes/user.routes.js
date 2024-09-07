import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = Router();

router.route("/register").post(asyncHandler(registerUser));
router.route("/login").post(asyncHandler(loginUser));
router.route("/logout").post(verifyJWT, asyncHandler(logoutUser));

export default router;
