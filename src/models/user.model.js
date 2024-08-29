import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { SALT_ROUNDS } from "../constants";
import { asyncHandler } from "../utils/asyncHandler";

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
    profilePhoto: {
      type: String,
    },
    friendList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Friend",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(
  "save",
  asyncHandler(async (next) => {
    if (!this.isModified("password")) return next();
    try {
      const salt = await bcryptjs.genSalt(SALT_ROUNDS);
      this.password = await bcryptjs.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  })
);

userSchema.methods.generateAccessToken = () => {
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

userSchema.methods.generateRefreshToken = () => {
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
