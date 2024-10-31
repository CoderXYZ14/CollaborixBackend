import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addQuestions,
  getQuestions,
  submitQuestion,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add-questions").post(asyncHandler(addQuestions));
router.route("/get-questions").get(asyncHandler(getQuestions));
router
  .route("/submit/:problemId")
  .post(verifyJWT, asyncHandler(submitQuestion));

export default router;
