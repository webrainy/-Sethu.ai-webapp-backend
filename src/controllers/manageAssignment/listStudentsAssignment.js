import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initassignmentItmModel from "../../models/assignmentItm.js";
import initassignmentModel from "../../models/assignment.js";
import initstudentmodel from "../../models/studentModel.js";
import initbatchModel from "../../models/batchModel.js";
import initaccountModel from "../../models/accountModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }
    let student_id;
    if (req.user.role == ROLE.STUDENT) {
      student_id = req.user.id;
    } else {
      student_id = req.query.student_id;
      if (student_id == "" || student_id == undefined) {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
      }
    }

    const assignmentItmModel = await initassignmentItmModel();
    const assignmentModel = await initassignmentModel();
    const studentModel = await initstudentmodel();
    const batchModel = await initbatchModel();
    const accountModel = await initaccountModel();

    let studentInfo = await studentModel.findAll({
      where: { isactive: STATE.ACTIVE, student_id: student_id },
      attributes: ["student_id", "name", "rollno"],
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          attributes: ["batch_id", "name"],
        },
      ],
    });

    let assignments = await assignmentItmModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
        student_id: student_id,
      },
      include: [
        {
          model: assignmentModel,
          as: "assignmentInfo",
          attributes: [
            "assignment_id",
            "title",
            "description",
            "url",
            "batch_id",
          ],
          include: [
            {
              model: accountModel,
              as: "createdBy",
              attributes: ["account_id", "name", "phone", "email", "role"],
              required: false,
            },
          ],
        },
      ],
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

    // if (assignments.length == 0) {
    //   return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "assignment"));
    // }

    return send(res, RESPONSE.SUCCESS, { studentInfo, assignments });
  } catch (error) {
    console.log("list students assignment", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
