import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, FEEDBACK_TYPE } from "../../config/constants.js";
import initFeedbackResultModel from "../../models/feedbackResultModel.js";

const router = Router();

const VALID_FEEDBACK_TYPES = Object.values(FEEDBACK_TYPE);

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (
      req.user.role !== ROLE.ADMIN &&
      req.user.role !== ROLE.SUB_ADMIN &&
      req.user.role !== ROLE.STUDENT
    ) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { feedback_id, student_id, feedbacks, comments } = req.body || {};

    if (!feedback_id)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "feedback_id"));
    if (!feedbacks || feedbacks.length === 0) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "feedbacks"));
    }

    // Validate feedback types
    const hasInvalidType = feedbacks.some(
      (f) => !VALID_FEEDBACK_TYPES.includes(Number(f.feedback_type)),
    );
    if (hasInvalidType) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "feedback_type"));
    }

    // Validate stars 1-5
    const hasInvalidStar = feedbacks.some(
      (f) => Number(f.feedback_star) < 1 || Number(f.feedback_star) > 5,
    );
    if (hasInvalidStar) {
      return send(
        res,
        setErrResMsg(RESPONSE.INVALID, "feedback_star must be between 1 and 5"),
      );
    }

    const finalStudentId =
      req.user.role === ROLE.STUDENT ? req.user.id : student_id;
    if (!finalStudentId)
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));

    const feedbackResultModel = await initFeedbackResultModel();

    await Promise.all(
      feedbacks.map(async ({ feedback_type, feedback_star }) => {
        const existing = await feedbackResultModel.findOne({
          where: {
            feedback_id,
            student_id: finalStudentId,
            feedback_type: Number(feedback_type),
          },
        });

        if (existing) {
          await feedbackResultModel.update(
            {
              feedback_star: Number(feedback_star),
              comments,
            },
            {
              where: {
                feedback_id,
                student_id: finalStudentId,
                feedback_type: Number(feedback_type),
              },
            },
          );
        } else {
          await feedbackResultModel.create({
            feedback_id,
            student_id: finalStudentId,
            feedback_type: Number(feedback_type),
            feedback_star: Number(feedback_star),
            comments,
          });
        }
      }),
    );

    return send(res, RESPONSE.SUCCESS);
  } catch (error) {
    console.log("Create Feedback Result:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
