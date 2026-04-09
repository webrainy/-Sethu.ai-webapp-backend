import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initassignmentItmModel from "../../models/assignmentItm.js";
import initassignmentModel from "../../models/assignment.js";
import initstudentmodel from "../../models/studentModel.js";
import initbatchModel from "../../models/batchModel.js";
import initstudentassignment from "../../models/studentassignment.js";

const router = Router();

// GET /api/assign/batch/report?batch_id=xxx
export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== ROLE.ADMIN && req.user.role !== ROLE.SUB_ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { batch_id } = req.query;
    if (!batch_id) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    const assignmentItmModel = await initassignmentItmModel();
    const assignmentModel = await initassignmentModel();
    const studentModel = await initstudentmodel();
    const batchModel = await initbatchModel();
    const studentAssignmentModel = await initstudentassignment();

    //  Get all assignments for this batch
    const assignments = await assignmentModel.findAll({
      where: { batch_id, isactive: STATE.ACTIVE },
      attributes: ["assignment_id", "title", "description", "url"],
      order: [["createdAt", "ASC"]],
    });

    // 2Get all students in this batch
    const students = await studentModel.findAll({
      where: { batch_id, isactive: STATE.ACTIVE },
      attributes: ["student_id", "name", "rollno"],
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          attributes: ["batch_id", "name"],
        },
      ],
      order: [["rollno", "ASC"]],
    });

    // 3. For each student, get their assignment statuses + submissions
    const studentsWithStatus = await Promise.all(
      students.map(async (student) => {
        const assignmentStatuses = await assignmentItmModel.findAll({
          where: {
            student_id: student.student_id,
            isactive: STATE.ACTIVE,
          },
          attributes: [
            "assign_id",
            "assignment_id",
            "compl_status",
            "assigned_on",
            "completed_at",
          ],
          include: [
            {
              model: studentAssignmentModel,
              as: "studentSubmission",
              attributes: [
                "stassign_id",
                "assignment_url",
                "assignment_doc",
                "assignment_description",
                "createdAt",
              ],
              required: false,
            },
          ],
        });

        return {
          student_id: student.student_id,
          name: student.name,
          rollno: student.rollno,
          batchInfo: student.batchInfo,
          assignmentStatus: assignmentStatuses.map((a) => a.toJSON()),
        };
      }),
    );

    return send(res, RESPONSE.SUCCESS, {
      assignments: assignments.map((a) => a.toJSON()),
      students: studentsWithStatus,
    });
  } catch (error) {
    console.log("Batch Assignment Report Error:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
