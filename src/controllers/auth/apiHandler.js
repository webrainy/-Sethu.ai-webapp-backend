import { Router } from "express";
import register from "./register.js";
import login from "./login.js";
import changePassword from "./changePassword.js";

const router = Router();

router.use("/register", register);
router.use("/login", login);
router.use("/change_pass", changePassword);

export default router;
