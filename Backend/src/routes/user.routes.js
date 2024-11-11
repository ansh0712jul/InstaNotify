import {Router} from "express"
import { LoginUser, LogoutUser, registerUser } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router=Router()


router.route("/register").post(registerUser)
router.route("/login").post(LoginUser)

//secured routes
router.route("/logout").
post(verifyJWT,LogoutUser)

export default router