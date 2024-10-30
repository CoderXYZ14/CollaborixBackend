import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addQuestions,
  getQuestions,
} from "../controllers/problem.controller.js";

const router = Router();

router.route("/add-questions").post(asyncHandler(addQuestions));
router.route("/get-questions").get(asyncHandler(getQuestions));

export default router;
