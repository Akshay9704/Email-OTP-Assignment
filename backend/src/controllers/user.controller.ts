import { Request as ExpressRequest, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User, UserDocument } from "../models/user.model";
import { UserOtp, UserOtpDocument } from "../models/user.otp";
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

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
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

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP to user email
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "OTP for account verification",
    text: `Your OTP for account verification is ${otp}`,
  };

  // Send email and save OTP
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      throw new ApiError(
        500,
        "Something went wrong while sending OTP to user email"
      );
    } else {
      // Create and save user OTP
      const userOtp = await UserOtp.create({ email, otp });
      console.log("Email sent: " + info.response);

      // Create user
      const user = await User.create({ firstName, lastName, email, password });

      // Generate access and refresh tokens
      const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

      // Update user with refresh token
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      // Filter sensitive data from user object
      const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
      if (!createUser) {
        throw new ApiError(
          500,
          "Something went wrong while registering the user"
        );
      }
      res
        .status(201)
        .json(
          new ApiResponse(
            200,
            { user: createUser, accessToken, refreshToken },
            "User registered successfully"
          )
        );
    }
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

const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  const { otp, email } = req.body;
  try {
    const otpverification = await UserOtp.findOne({ $or: [{ email }] });
    if (otpverification?.otp === otp) {
      const user = await User.findOne({ $or: [{ email }] });
      if (!user) {
        throw new ApiError(404, "User not found");
      }
      const { refreshToken } =
        await generateAccessAndRefreshTokens(user._id);
        
      const verifyingUser = (await User.findById(user._id)).isSelected(
        "-password -refreshToken"
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { message: "User Verified Successfully", userToken: refreshToken, verifyingUser },
          )
        );
    } else {
      throw new ApiError(401, "Invalid OTP");
    }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while verifying the user");
  }
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

export { registerUser, loginUser, getCurrentUser, logoutUser, verifyUser };
