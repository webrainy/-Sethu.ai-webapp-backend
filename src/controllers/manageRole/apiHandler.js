import { Router } from "express";
import createAccount from "./createRole.js";
import listReviewer from "./listReviewer.js";
import listAdmin from "./listAdmin.js";
import createAdmin from "./createAdmin.js";

const router = Router();

router.use("/create_acc", createAccount);
router.use("/list_rev", listReviewer);
router.use("/list_admin", listAdmin);
router.use("/create_super_admin", createAdmin);


export default router;
