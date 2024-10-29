import mongoose, { Schema } from "mongoose";

const problemSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    videoId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Problem = mongoose.model("Problem", problemSchema);
