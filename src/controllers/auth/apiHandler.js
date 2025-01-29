import { Router } from "express";
import register from "./register.js";

import login from "./login.js";
const router = Router();

router.use("/register", register);
router.use("/login", login);

export default router;
