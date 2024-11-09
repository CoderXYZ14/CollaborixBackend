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

const getQuestions = async (req, res, next) => {
  try {
    const problems = await Problem.find().sort("order");

    if (req.user) {
      const solvedProblems = new Set(
        req.user.solvedProblemList.map((p) => p.toString())
      );

      const problemsWithStatus = problems.map((problem) => ({
        ...problem.toObject(),
        submitted: solvedProblems.has(problem._id.toString()),
      }));

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            problemsWithStatus,
            "Problems retrieved successfully"
          )
        );
    }

    // For unauthenticated users, return problems with submitted = false
    const problemsWithoutStatus = problems.map((problem) => ({
      ...problem.toObject(),
      submitted: false,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          problemsWithoutStatus,
          "Problems retrieved successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.status)
        .json(new ApiResponse(error.status, null, error.message));
    } else {
      console.error("Error fetching questions:", error);
      res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            "An error occurred while retrieving problems"
          )
        );
    }
  }
};
const submitQuestion = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  const problem = await Problem.findOne({ id: problemId });
  if (!problem) throw new ApiError(409, "Problem not found");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(409, "User not found");

  if (!user.solvedProblemList.includes(problem._id)) {
    user.solvedProblemList.push(problem._id);
    await user.save();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem marked as solved"));
};

const solvedStatus = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user._id;

  try {
    const problem = await Problem.findOne({ id: problemId });
    if (!problem) {
      return res
        .status(404)
        .json(new ApiResponse(404, { success: false }, "Problem not found"));
    }

    const user = await User.findById(userId).populate("solvedProblemList");
    const isSolved = user.solvedProblemList.some(
      (solvedProblem) => solvedProblem.id === problemId
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { success: true, solved: isSolved },
          "Problem status retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error checking problem solved status:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, { success: false }, "Server error"));
  }
};

export { addQuestions, getQuestions, submitQuestion, solvedStatus };
