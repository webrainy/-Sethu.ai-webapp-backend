import { Router } from "express";
import createAccount from "./createReviewer.js";
import listReviewer from "./listReviewer.js";

const router = Router();

router.use("/create_acc", createAccount);
router.use("/list_rev", listReviewer);



export default router;
