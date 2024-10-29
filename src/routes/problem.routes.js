import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addQuestions,
  getQuestions,
} from "../controllers/problem.controller.js";

const router = Router();

router.route("/add-questions").post(asyncHandler(addQuestions));
router.router("/get-questions").post(asyncHandler(getQuestions));

export default router;
