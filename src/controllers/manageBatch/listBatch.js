import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initbatchModel from "../../models/batchModel.js";
import { ROLE, STATE } from "../../config/constants.js";
import initstudentmodel from "../../models/studentModel.js";
import initassignmentModel from "../../models/assignment.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    let query = {
      isactive: STATE.ACTIVE,
    };

    let studentAttribute = [];

    req.query.batch_id
      ? (query.batch_id = req.query.batch_id) &&
        (studentAttribute = [
          "student_id",
          "name",
          "phone",
          "email",

          // "location",
          // "education",
          // "cgpa",
          // "year_passed",
          // "gmat",
          // "course_prep",
          // "curnt_work",
          // "commit_ft",
          // "sk_python",
          // "sk_sql",
          // "sk_java",
          // "sk_analyticalskill",
          // "sk_prblmsolving",
          // "sk_engprof",
          // "hckr_rnk",
          // "hobbies",
          // "linkedin_url",
          // "github_url",
          // "resume",
          // "coverletter",
          // "father_occ",
          // "mother_occ",
          // "income",
          "review",
          "current_state",
        ])
      : "";

    const batchModel = await initbatchModel();
    const studentModel = await initstudentmodel();
    const assignmentModel = await initassignmentModel();

    let batchData = await batchModel.findAll({
      where: query,
      attributes: ["batch_id", "name"],

      include: [
        {
          model: studentModel,
          as: "students",
          attributes: studentAttribute,
        },
      ],
    });

    if (batchData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "student data"));
    }

    // batchData = await Promise.all(
      batchData.map(async (itm) => {
        // let batchAssignment;
     
        // if (req.query.batch_id) {
        //   batchAssignment = await assignmentModel.findAll({
        //     where: {
        //       batch_id: itm.batch_id,
        //     },
        //     attributes: ["assignment_id", "title", "description", "createdAt"],
        //     order: [["createdAt", "DESC"]],
        //   });

        // }

        return {
          batch_id: itm.batch_id,
          name: itm.name,
          students: itm.students,
          // batchAssignment,
        };
      })
    // );



    return send(res, RESPONSE.SUCCESS, batchData);
  } catch (error) {
    console.log(error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
