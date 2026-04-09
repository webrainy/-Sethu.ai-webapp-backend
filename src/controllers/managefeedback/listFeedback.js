import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE, FEEDBACK_TYPE } from "../../config/constants.js";
import initFeedbackResultModel from "../../models/feedbackResultModel.js";
import initstudentmodel from "../../models/studentModel.js";
import initFeedbackModel from "../../models/feedback.js";

const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (
      req.user.role !== ROLE.ADMIN &&
      req.user.role !== ROLE.SUB_ADMIN &&
      req.user.role !== ROLE.STUDENT
    ) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const feedbackModel = await initFeedbackModel();
    const feedbackResultModel = await initFeedbackResultModel();
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

    const { count, rows: feedbacks } = await feedbackModel.findAndCountAll({
      where: {
        batch_id: isAdmin ? batch_id : studentBatchId,
        isactive: STATE.ACTIVE,
      },
      attributes: [
        "feedback_id",
        "title",
        "feedback_date",
        "batch_id",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    const feedbacksWithResults = await Promise.all(
      feedbacks.map(async (fb) => {
        const fbJson = fb.toJSON();

        if (isAdmin) {
          const results = await feedbackResultModel.findAll({
            where: { feedback_id: fb.feedback_id, isactive: STATE.ACTIVE },
            attributes: [
              "result_id",
              "feedback_type",
              "feedback_star",
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

          // Group results by student_id
          const groupedByStudent = {};
          results.forEach((r) => {
            const rJson = r.toJSON();
            const sid = rJson.student_id;
            if (!groupedByStudent[sid]) {
              groupedByStudent[sid] = {
                student_id: sid,
                studentInfo: rJson.studentInfo,
                comments: rJson.comments,
                feedbacks: {},
              };
            }
            const typeLabel =
              rJson.feedback_type === FEEDBACK_TYPE.SOFT_SKILL
                ? "soft_skill"
                : rJson.feedback_type === FEEDBACK_TYPE.TECHNICAL
                  ? "technical"
                  : rJson.feedback_type === FEEDBACK_TYPE.JOB_NEED
                    ? "job_need"
                    : "unknown";

            groupedByStudent[sid].feedbacks[typeLabel] = rJson.feedback_star;
          });

          return {
            ...fbJson,
            results: Object.values(groupedByStudent),
            hasResults: results.length > 0,
          };
        } else {
          const results = await feedbackResultModel.findAll({
            where: {
              feedback_id: fb.feedback_id,
              student_id: req.user.id,
              isactive: STATE.ACTIVE,
            },
            attributes: [
              "result_id",
              "feedback_type",
              "feedback_star",
              "comments",
            ],
          });

          const feedbackMap = {};
          let comments = null;
          results.forEach((r) => {
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
            ...fbJson,
            result: results.length > 0 ? { ...feedbackMap, comments } : null,
            hasResults: results.length > 0,
          };
        }
      }),
    );

    return send(res, RESPONSE.SUCCESS, {
      currentPage: pageNum,
      totalPages,
      totalCount: count,
      feedbacks: feedbacksWithResults,
    });
  } catch (error) {
    console.log("List Feedback:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
