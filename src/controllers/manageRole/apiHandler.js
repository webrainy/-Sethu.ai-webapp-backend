import { Router } from "express";
import createAccount from "./createRole.js";
import listReviewer from "./listReviewer.js";
import listAdmin from "./listAdmin.js";

const router = Router();

router.use("/create_acc", createAccount);
router.use("/list_rev", listReviewer);
router.use("/list_admin", listAdmin);

export default router;
