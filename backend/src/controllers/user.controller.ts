import { Request as ExpressRequest, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User, UserDocument } from "../models/user.model";
import { UserOtp } from "../models/user.otp";
import nodeMailer from "nodemailer";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface Request extends ExpressRequest {
  user?: UserDocument;
}

const generateAccessAndRefreshTokens = async (
  userId: string
): Promise<TokenResponse> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const generateOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Email configuration
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // Generate unique OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP to user email
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "OTP for account verification",
    text: `Your OTP for account verification is ${otp}`,
  };

  // Send email
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      throw new ApiError(
        500,
        "Something went wrong while sending OTP to user email"
      );
    } else {
      console.log("Email sent: " + info.response);
      // Save OTP in the database
      await UserOtp.create({ vemail: email, otp });
      res.status(200).json({ message: "OTP sent successfully" });
    }
  });
});

// Endpoint to verify OTP and register user
const verifyOtpAndRegister = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, firstName, lastName, password } = req.body;
  if (!email || !otp || !firstName || !lastName || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Find OTP record
  const userOtp = await UserOtp.findOne({ vemail: email, otp });
  if (!userOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP verified, register the user
  const user = await User.create({ firstName, lastName, email, password });

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id 
  );
  return res.status(200).json({
    user,
    accessToken,
    refreshToken,
  });
});


const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ $or: [{ email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
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
        "User logged In Successfully"
      )
    );
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const removeOtp = asyncHandler(async (req, res) => {
  const { vemail } = req.params;
  const remove = await UserOtp.findByIdAndDelete(vemail); 
  return res
      .status(200)
      .json(new ApiResponse(200, remove, "OTP removed Please Signup again"));
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
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
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export {
  loginUser,
  getCurrentUser,
  logoutUser,
  generateOtp,
  verifyOtpAndRegister,
  removeOtp
};
