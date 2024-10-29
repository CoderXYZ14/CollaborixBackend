import { Problem } from "../models/problem.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const addQuestions = async (req, res) => {
  const { id, title, difficulty, category, videoId } = req.body;

  if ([id, title, difficulty, category].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingProblem = await Problem.findOne({
    $or: [{ id }, { title }],
  });

  if (existingProblem) {
    throw new ApiError(409, "Problem already exists");
  }
  const maxOrderProblem = await Problem.findOne({})
    .sort({ order: -1 })
    .select("order");

  const newOrder = maxOrderProblem ? maxOrderProblem.order + 1 : 1;

  const problem = await Problem.create({
    id,
    title,
    difficulty,
    category,
    order: newOrder,
    videoId,
  });

  if (problem) {
    throw new ApiError(500, "Something went wrong while adding question");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem added  successfully"));
};
export { addQuestions };
