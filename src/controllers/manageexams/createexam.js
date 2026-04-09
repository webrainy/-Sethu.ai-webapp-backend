import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { ROLE } from "../../config/constants.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initBatchExamModel from "../../models/batchExamModel.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    let { title, exam_datetime, batch_id } = req.body || {};

    if (!title) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "Title"));
    }

    if (!batch_id) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    let batch_exam = await initBatchExamModel();
    await batch_exam.create({
      title: title,
      exam_datetime,
      batch_id: batch_id,
    });
    return send(res, RESPONSE.SUCCESS);
  } catch (error) {
    console.log("Create Exam:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
