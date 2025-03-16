import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { SALT_ROUNDS } from "../constants.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      index: true,
    },
    friendList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Friend",
      },
    ],
    solvedProblemList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    password: {
      type: String,
      required: function () {
        // Password is required only if the user is not signing up with Google
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values (for non-Google users)
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Only hash the password if it exists and has been modified
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.isPasswordCorrect = function (password) {
  // Only compare passwords if a password exists for this user
  if (!this.password) {
    return false;
  }
  return bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
