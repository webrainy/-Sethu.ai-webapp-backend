import { Router } from "express";

import createAttendance from "./createAttendance.js";
import listAttendance from "./listAttendance.js";
import editAttendance from "./editAttendance.js";

const router = Router();

router.use("/create", createAttendance);
router.use("/list", listAttendance);
router.use("/edit", editAttendance);

export default router;
