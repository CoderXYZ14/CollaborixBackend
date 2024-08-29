import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: profilePhoto }]), registerUser);
router.route("login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
