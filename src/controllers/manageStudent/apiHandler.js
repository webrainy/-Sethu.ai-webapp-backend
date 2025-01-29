import { Router } from "express";

import createStudent from "./createStudent.js";
import listStudent from "./listStudent.js";
import updateStudent from "./updateStudent.js";



const router = Router();

router.use("/create", createStudent);
router.use("/list", listStudent);
router.use("/update", updateStudent);





export default router;
