import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    image: String,
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = models.User || mongoose.model("User", UserSchema);
