import { Router } from "express";
import createfeedback from "./createfeedback.js";
import createFeedbackResult from "./createFeedbackResult.js";
import listFeedback from "./listFeedback.js";
import getFeedbackDetail from "./getFeedbackDetail.js";

const router = Router();

router.use("/create", createfeedback);
router.use("/createfeedbackresult", createFeedbackResult);
router.use("/list", listFeedback);
router.use("/detail", getFeedbackDetail);

export default router;
