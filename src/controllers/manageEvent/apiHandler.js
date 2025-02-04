import { Router } from "express";

import createEvent from "./createEvent.js";
import listEvent from "./listEvent.js";
import listStudentsEvent from "./listStudentsEvent.js";

const router = Router();

router.use("/create", createEvent);
router.use("/list", listEvent);
router.use("/student", listStudentsEvent);
// router.use("/status", completionStatus);

export default router;
