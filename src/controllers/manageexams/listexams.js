import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initexamResultModel from "../../models/examResultModel.js";
import initstudentmodel from "../../models/studentModel.js";
import initBatchExamModel from "../../models/batchExamModel.js";

const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (
      req.user.role != ROLE.ADMIN &&
      req.user.role != ROLE.STUDENT &&
      req.user.role != ROLE.SUB_ADMIN
    ) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const batch_exam = await initBatchExamModel();
    const examResultModel = await initexamResultModel();
    const studentModel = await initstudentmodel();

    const isAdmin =
      req.user.role === ROLE.ADMIN || req.user.role === ROLE.SUB_ADMIN;

    const { batch_id, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (isAdmin && !batch_id) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    let studentBatchId = null;
    if (!isAdmin) {
      const student = await studentModel.findOne({
        where: { student_id: req.user.id },
        attributes: ["batch_id"],
      });
      if (!student || !student.batch_id) {
        return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "Student batch"));
      }
      studentBatchId = student.batch_id;
    }

    // Paginated exam fetch with count
    const { count, rows: exams } = await batch_exam.findAndCountAll({
      where: {
        batch_id: isAdmin ? batch_id : studentBatchId,
        isactive: STATE.ACTIVE,
      },
      attributes: [
        "exam_id",
        "title",
        "exam_datetime",
        "batch_id",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    const examsWithResults = await Promise.all(
      exams.map(async (exam) => {
        const examJson = exam.toJSON();

        if (isAdmin) {
          const results = await examResultModel.findAll({
            where: { exam_id: exam.exam_id, isactive: STATE.ACTIVE },
            attributes: [
              "result_id",
              "marks",
              "total_marks",
              "comments",
              "student_id",
            ],
            include: [
              {
                model: studentModel,
                as: "studentInfo",
                attributes: ["student_id", "name", "rollno"],
              },
            ],
          });
          return {
            ...examJson,
            results: results.map((r) => r.toJSON()),
            hasMarks: results.length > 0,
          };
        } else {
          const result = await examResultModel.findOne({
            where: {
              exam_id: exam.exam_id,
              student_id: req.user.id,
              isactive: STATE.ACTIVE,
            },
            attributes: ["result_id", "marks", "total_marks", "comments"],
          });
          return {
            ...examJson,
            result: result ? result.toJSON() : null,
            hasMarks: !!result,
          };
        }
      }),
    );

    return send(res, RESPONSE.SUCCESS, {
      currentPage: pageNum,
      totalPages,
      totalCount: count,
      exams: examsWithResults,
    });
  } catch (error) {
    console.log("List Exams:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
