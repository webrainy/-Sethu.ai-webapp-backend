import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initassignmentItmModel from "../../models/assignmentItm.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const student_id = req.query.student_id;

    if (student_id == "" || student_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    }

    const assignmentItmModel = await initassignmentItmModel();

    let assignments = await assignmentItmModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
        student_id: student_id,
      },
      attributes: [
        "assign_id",
        "compl_status",
        "assigned_on",
        "completed_at",
        "student_id",
        "assignment_id",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    if (assignments.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "assignment"));
    }

    return send(res, RESPONSE.SUCCESS, assignments);
  } catch (error) {
    console.log("list students assignment", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
