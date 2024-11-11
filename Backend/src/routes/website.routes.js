import { Router } from "express";
import { createWebsite,getAllwebsites } from "../controllers/website.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js ";
import { deleteWebsite } from "../controllers/website.controller.js";
const router=Router()

router.route("/create").post(verifyJWT,createWebsite)
router.route("/delete/:webId").delete(verifyJWT,deleteWebsite)
router.route("/all").get(verifyJWT,getAllwebsites)
export default router