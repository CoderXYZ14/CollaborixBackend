import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Original verifyJWT for protected routes
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      throw new ApiError(
        401,
        "Access denied. Please login to access this resource."
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid access token");

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid access token");
  }
});

// New middleware for optional authentication
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      // No token, but that's okay - continue without user
      req.user = null;
      return next();
    }

    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      // Set user if found, otherwise null
      req.user = user || null;
    } catch (tokenError) {
      // Invalid token, but that's okay - continue without user
      req.user = null;
    }

    next();
  } catch (err) {
    // For any other errors, continue without user
    req.user = null;
    next();
  }
});
