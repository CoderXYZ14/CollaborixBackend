import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addQuestions } from "../controllers/problem.controller.js";

const router = Router();

router.route("/add-questions").post(asyncHandler(addQuestions));

export default router;
