import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  COMPLITION_STATUS,
  EXISTING_ASSIGNMENT,
  ROLE,
  STATE,
} from "../../config/constants.js";
import { sendEmails } from "../../middlewares/emailMessage.js";
import initassignmentModel from "../../models/assignment.js";
import authenticate from "../../middlewares/authenticate.js";
import initAssignmentItm from "../../models/assignmentItm.js";
import initstudentmodel from "../../models/studentModel.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    let {
      exstng_assign,
      title,
      description,
      url,
      assignment_id,
      student_id,
      batch_id,
    } = req.body;

    let assignmentModel = await initassignmentModel();
    let assignmentItmModel = await initAssignmentItm();
    let studentModel = await initstudentmodel();

    if (exstng_assign == "" || exstng_assign == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "exstng_assign"));
    }
    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }
    if (student_id == "" || student_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    }

    if (!Array.isArray(student_id)) {
      student_id = [student_id];
    }

    let assigned_on = Date.now();

    if (exstng_assign == EXISTING_ASSIGNMENT.NO) {
      if (title == "" || title == undefined) {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "title"));
      }
      if (description == "" || description == undefined) {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "description"));
      }

      let assignment = await assignmentModel.create({
        title,
        description,
        url,
        batch_id: batch_id,
      });

      for (let i = 0; i < student_id.length; i++) {
        await assignmentItmModel.create({
          compl_status: COMPLITION_STATUS.PENDING,
          assigned_on: assigned_on,
          student_id: student_id[i],
          assignment_id: assignment.assignment_id,
        });
        let student = await studentModel.findOne({
          where: {
            isactive: STATE.ACTIVE,
            student_id: student_id[i],
          },
        });

        // let message = {
        //   subject: `Assignment Notification`,
        //   text: `Hello ${student.name},\n\nYou have a new assignment. Check your portal.\n\nBest,\nYour Instructor`,
        // };

        // sendEmails(student, message);
      }
    } else if (exstng_assign == EXISTING_ASSIGNMENT.YES) {
      if (assignment_id == "" || assignment_id == undefined) {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "assignment_id"));
      }

      for (let i = 0; i < student_id.length; i++) {
        await assignmentItmModel.create({
          compl_status: COMPLITION_STATUS.PENDING,
          assigned_on: assigned_on,
          student_id: student_id[i],
          assignment_id: assignment_id,
        });

        let student = await studentModel.findOne({
          where: {
            isactive: STATE.ACTIVE,
            student_id: student_id[i],
          },
        });

        // let message = {
        //   subject: `Assignment Notification`,
        //   text: `Hello ${student.name},\n\nYou have a new assignment. Check your portal.\n\nBest,\nYour Instructor`,
        // };

        // sendEmails(student, message);
      }
    }

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create assignment", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
