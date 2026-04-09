import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE, FEEDBACK_TYPE } from "../../config/constants.js";
import initFeedbackModel from "../../models/feedback.js";
import initFeedbackResultModel from "../../models/feedbackResultModel.js";
import initstudentmodel from "../../models/studentModel.js";
import initAttendanceModel from "../../models/attendanceModel.js";
import initattendanceItm from "../../models/attendanceitmModel.js";
import initBatchExamModel from "../../models/batchExamModel.js";
import initexamResultModel from "../../models/examResultModel.js";
import { Op } from "sequelize";

const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== ROLE.ADMIN && req.user.role !== ROLE.SUB_ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { feedback_id, page = 1, limit = 10 } = req.query;
    if (!feedback_id)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "feedback_id"));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const feedbackModel = await initFeedbackModel();
    const feedbackResultModel = await initFeedbackResultModel();
    const studentModel = await initstudentmodel();
    const attendanceModel = await initAttendanceModel();
    const attendanceItmModel = await initattendanceItm();
    const batchExamModel = await initBatchExamModel();
    const examResultModel = await initexamResultModel();

    // 1. Get feedback
    const feedback = await feedbackModel.findOne({
      where: { feedback_id, isactive: STATE.ACTIVE },
      attributes: ["feedback_id", "title", "feedback_date", "batch_id"],
    });
    if (!feedback)
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "Feedback"));

    const fbJson = feedback.toJSON();
    const batch_id = fbJson.batch_id;

    // 2. Get all class and lab attendance IDs for this batch
    const classAttendances = await attendanceModel.findAll({
      where: { batch_id, attendance_type: 1, isactive: STATE.ACTIVE },
      attributes: ["attendance_id"],
    });
    const labAttendances = await attendanceModel.findAll({
      where: { batch_id, attendance_type: 2, isactive: STATE.ACTIVE },
      attributes: ["attendance_id"],
    });

    const classIds = classAttendances.map((a) => a.attendance_id);
    const labIds = labAttendances.map((a) => a.attendance_id);
    const totalClassCount = classIds.length;
    const totalLabCount = labIds.length;

    // 3. Get all exams for this batch
    const exams = await batchExamModel.findAll({
      where: { batch_id, isactive: STATE.ACTIVE },
      attributes: ["exam_id", "title"],
      order: [["createdAt", "ASC"]],
    });

    // 4. Get paginated students
    const { count, rows: students } = await studentModel.findAndCountAll({
      where: { batch_id, isactive: STATE.ACTIVE },
      attributes: ["student_id", "name", "rollno", "education", "cgpa"],
      order: [["rollno", "ASC"]],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    // 5. Build combined data per student
    const studentsWithData = await Promise.all(
      students.map(async (student) => {
        const sJson = student.toJSON();

        // Attendance counts
        const studentClassCount =
          classIds.length > 0
            ? await attendanceItmModel.count({
                where: {
                  student_id: sJson.student_id,
                  attendance_id: { [Op.in]: classIds },
                  attendance_status: 1,
                  isactive: STATE.ACTIVE,
                },
              })
            : 0;

        const studentLabCount =
          labIds.length > 0
            ? await attendanceItmModel.count({
                where: {
                  student_id: sJson.student_id,
                  attendance_id: { [Op.in]: labIds },
                  attendance_status: 1,
                  isactive: STATE.ACTIVE,
                },
              })
            : 0;

        const classPercent =
          totalClassCount > 0
            ? Math.round((studentClassCount / totalClassCount) * 100)
            : 0;
        const labPercent =
          totalLabCount > 0
            ? Math.round((studentLabCount / totalLabCount) * 100)
            : 0;

        // All exam results
        const examResults = await Promise.all(
          exams.map(async (exam) => {
            const result = await examResultModel.findOne({
              where: {
                exam_id: exam.exam_id,
                student_id: sJson.student_id,
                isactive: STATE.ACTIVE,
              },
              attributes: ["marks", "total_marks"],
            });
            return {
              exam_id: exam.exam_id,
              title: exam.title,
              marks: result ? `${result.marks}/${result.total_marks}` : "—",
            };
          }),
        );

        // Feedback results
        const feedbackResults = await feedbackResultModel.findAll({
          where: {
            feedback_id,
            student_id: sJson.student_id,
            isactive: STATE.ACTIVE,
          },
          attributes: ["feedback_type", "feedback_star", "comments"],
        });

        const feedbackMap = {};
        let comments = null;
        feedbackResults.forEach((r) => {
          const rJson = r.toJSON();
          comments = rJson.comments;
          const typeLabel =
            rJson.feedback_type === FEEDBACK_TYPE.SOFT_SKILL
              ? "soft_skill"
              : rJson.feedback_type === FEEDBACK_TYPE.TECHNICAL
                ? "technical"
                : rJson.feedback_type === FEEDBACK_TYPE.JOB_NEED
                  ? "job_need"
                  : "unknown";
          feedbackMap[typeLabel] = rJson.feedback_star;
        });

        return {
          student_id: sJson.student_id,
          name: sJson.name,
          rollno: sJson.rollno,
          education: sJson.education,
          cgpa: sJson.cgpa,
          class_percent: classPercent,
          lab_percent: labPercent,
          exam_results: examResults,
          feedback: {
            soft_skill: feedbackMap.soft_skill || null,
            technical: feedbackMap.technical || null,
            job_need: feedbackMap.job_need || null,
            comments: comments || null,
            hasFeedback: feedbackResults.length > 0,
          },
        };
      }),
    );

    return send(res, RESPONSE.SUCCESS, {
      feedback: fbJson,
      exams: exams.map((e) => e.toJSON()),
      currentPage: pageNum,
      totalPages,
      totalCount: count,
      students: studentsWithData,
    });
  } catch (error) {
    console.log("Get Feedback Detail:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
