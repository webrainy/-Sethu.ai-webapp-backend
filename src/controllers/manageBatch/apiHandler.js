import { Router } from "express";

import createBatch from "./createBatch.js";
import listBatch from "./listBatch.js";
import editBatch from "./editBatch.js";

const router = Router();

router.use("/create", createBatch);
router.use("/list", listBatch);
router.use("/edit", editBatch);

export default router;
