import { Router } from "express";
import createexam from "./createexam.js";
import listexams from "./listexams.js";
import createExamResult from "./createExamResult.js";
import updateExamResult from "./updateExamResult.js";

const router = Router();

router.use("/create", createexam);
router.use("/list", listexams);
router.use("/result/create", createExamResult);
router.use("/result/update", updateExamResult);

export default router;
