import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserOtpDocument extends Document {
  _id: Types.ObjectId;
  vemail: string;
  otp: string;
}

const userOtpSchema = new Schema<UserOtpDocument>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    vemail: {
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

export const UserOtp = mongoose.model<UserOtpDocument>("UserOtp", userOtpSchema);
