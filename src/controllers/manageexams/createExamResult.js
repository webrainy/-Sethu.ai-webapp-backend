import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE } from "../../config/constants.js";
import initexamResultModel from "../../models/examResultModel.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== ROLE.ADMIN && req.user.role !== ROLE.SUB_ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { exam_id, student_id, marks, total_marks, comments } =
      req.body || {};

    if (!exam_id) return send(res, setErrResMsg(RESPONSE.REQUIRED, "exam_id"));
    if (!student_id)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    if (!marks) return send(res, setErrResMsg(RESPONSE.REQUIRED, "marks"));
    if (!total_marks)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "Total Marks"));
    const examResultModel = await initexamResultModel();

    // Check if result already exists
    const existing = await examResultModel.findOne({
      where: { exam_id, student_id },
    });

    if (existing) {
      // Update if already exists
      await examResultModel.update(
        { marks, total_marks, comments },
        { where: { exam_id, student_id } },
      );
    } else {
      // Create new
      await examResultModel.create({
        exam_id,
        student_id,
        marks,
        total_marks,
        comments,
      });
    }

    return send(res, RESPONSE.SUCCESS);
  } catch (error) {
    console.log("Create Exam Result:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
