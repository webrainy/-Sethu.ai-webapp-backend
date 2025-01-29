import { Router } from "express";
import createAdmin from "../manageAdmin/createAdmin.js";
const router = Router();

router.use("/create_admin", createAdmin);


export default router;
