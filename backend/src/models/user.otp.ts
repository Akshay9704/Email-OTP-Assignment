import mongoose, { Schema, Document } from "mongoose";

export interface UserOtpDocument extends Document {
  email: string;
  otp: string;
}

const userOtpSchema = new Schema<UserOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserOtp = mongoose.model<UserOtpDocument>(
  "UserOtp",
  userOtpSchema
);
