import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Error generating access and refresh token");
  }
};
const registerUser = async (req, res) => {
  try {
    const { fullName, email, username, password, googleId } = req.body;

    // Validate required fields for form-based signup
    if (
      !googleId &&
      [fullName, email, username, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      // If the user exists and is trying to sign up with Google, link the Google ID
      if (googleId && !existingUser.googleId) {
        existingUser.googleId = googleId;
        await existingUser.save();
        const updatedUser = await User.findById(existingUser._id).select(
          "-password -refreshToken"
        );
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedUser,
              "Google account linked successfully"
            )
          );
      } else {
        throw new ApiError(409, "User already exists");
      }
    }

    // Create a new user
    const user = await User.create({
      fullName,
      email,
      username,
      password: googleId ? undefined : password, // Password is optional for Google users
      googleId,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createdUser,
          googleId
            ? "Signed up with Google successfully"
            : "User registered successfully"
        )
      );
  } catch (error) {
    console.error("Registration error details:", error);
    throw new ApiError(500, "Something went wrong while registering the user");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password, googleId } = req.body;

  // Check if the user is logging in with Google
  if (googleId) {
    const user = await User.findOne({ googleId });

    if (!user) {
      throw new ApiError(404, "User not found. Please sign up first.");
    }

    // Generate tokens for Google-authenticated user
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully with Google"
        )
      );
  }

  // If the user is logging in with email/password
  if (!identifier) {
    throw new ApiError(400, "Please provide username or email");
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  // Check if the user has a password (i.e., not a Google-authenticated user)
  if (!user.password) {
    throw new ApiError(401, "Please sign in with Google");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens for email/password-authenticated user
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
