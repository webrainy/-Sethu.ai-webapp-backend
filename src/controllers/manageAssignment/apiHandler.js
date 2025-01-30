import { Router } from "express";

import createAssignment from "./createAssignment.js";
import listAssignment from "./listAssignment.js";
import listStudentsAssignment from "./listStudentsAssignment.js";
import completionStatus from "./completionStatus.js";





const router = Router();

router.use("/create", createAssignment);
router.use("/list", listAssignment);
router.use("/student", listStudentsAssignment);
router.use("/status", completionStatus);





export default router;
