import { Router } from "express";

import createAttendance from "./createAttendance.js";
import listAttendance from "./listAttendance.js";
import editAttendance from "./editAttendance.js";
import previousday from "./previousday.js";

const router = Router();

router.use("/create", createAttendance);
router.use("/list", listAttendance);
router.use("/perviouslist", previousday);
router.use("/edit", editAttendance);

export default router;
