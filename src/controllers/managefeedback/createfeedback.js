import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE } from "../../config/constants.js";
import initFeedbackModel from "../../models/feedback.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== ROLE.ADMIN && req.user.role !== ROLE.SUB_ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { title, feedback_date, batch_id } = req.body || {};

    if (!title) return send(res, setErrResMsg(RESPONSE.REQUIRED, "Title"));
    if (!batch_id)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));

    const feedbackModel = await initFeedbackModel();
    await feedbackModel.create({ title, feedback_date, batch_id });

    return send(res, RESPONSE.SUCCESS);
  } catch (error) {
    console.log("Create Feedback:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
