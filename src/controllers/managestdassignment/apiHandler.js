import { Router } from "express";
import createstudentassignment from "./createstudentassignment.js";
import liststassignment from "./liststassignment.js";

const router = Router();

router.use("/create", createstudentassignment);
router.use("/list", liststassignment);

export default router;
