import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE } from "../../config/constants.js";
import initexamResultModel from "../../models/examResultModel.js";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== ROLE.ADMIN && req.user.role !== ROLE.SUB_ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { result_id, marks, total_marks, comments } = req.body || {};

    if (!result_id)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "result_id"));
    if (!marks) return send(res, setErrResMsg(RESPONSE.REQUIRED, "marks"));

    const examResultModel = await initexamResultModel();

    const result = await examResultModel.findOne({
      where: { result_id },
    });

    if (!result) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "Result"));
    }

    await examResultModel.update(
      { marks, total_marks, comments },
      { where: { result_id } },
    );

    return send(res, RESPONSE.SUCCESS);
  } catch (error) {
    console.log("Update Exam Result:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
