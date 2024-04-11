import { Router } from "express";
import { loginUser, logoutUser, verifyOtpAndRegister,  getCurrentUser, generateOtp, removeOtp} from "../controllers/user.controller";

const router = Router();

router.route("/register").post(verifyOtpAndRegister)

router.route("/login").post(loginUser)

router.route("/verify").post(generateOtp)

router.route("/current-user").get(getCurrentUser)

router.route("/remove-otp/:id").delete(removeOtp)

router.route("/logout").post(logoutUser)

export default router;