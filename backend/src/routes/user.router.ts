import { Router } from "express";
import { loginUser, logoutUser, registerUser, getCurrentUser, verifyUser} from "../controllers/user.controller";

const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/verify").post(verifyUser)

router.route("/current-user").get(getCurrentUser)

router.route("/logout").post(logoutUser)

export default router;