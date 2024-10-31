import { Problem } from "../models/problem.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  if (!problem) {
    throw new ApiError(500, "Something went wrong while adding question");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem added  successfully"));
};

const getQuestions = async (req, res) => {
  const problems = await Problem.find().sort("order");
  if (!problems || problems.length === 0)
    throw new ApiError(404, "No questions found");

  return res
    .status(200)
    .json(new ApiResponse(200, problems, "Problems retrieved successfully"));
};

const submitQuestion = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  const problem = await Problem.findOne({ id: problemId });
  if (!problem) throw new ApiError(409, "Problem not found");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(409, "User not found");

  if (user.solvedProblemList.includes(problem._id))
    throw new ApiError(409, "Problem already solved");

  user.solvedProblemList.push(problem._id);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem marked as solved"));
};

const solvedStatus = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user._id;
  const problem = await Problem.findOne({ id: problemId });
  if (!problem) throw new ApiError(404, "Problem not found");

  const user = await User.findById(userId).populate("solvedProblemList");

  const isSolved = user.solvedProblemList.some(
    (solvedProblem) => solvedProblem.id === problemId
  );

  if (!isSolved) throw new ApiError(404, "Error checking problem status");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { success: true }, "Problem solved successfully")
    );
};
export { addQuestions, getQuestions, submitQuestion };
