import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initstudentModel from "../../models/studentModel.js";
import { ROLE, STATE } from "../../config/constants.js";

import initbatchModel from "../../models/batchModel.js";
import { Op } from "sequelize";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const studentModel = await initstudentModel();
    const batchModel = await initbatchModel();

    let query = {
      isactive: STATE.ACTIVE,
    };

    req.query.searchkey
      ? (query.name = {
          [Op.iLike]: `%${req.query.searchkey}%`,
        })
      : "";

    let studentData = await studentModel.findAll({
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          attributes: ["name"],
        },
      ],
      where: query,
      attributes: [
        "student_id",
        "name",
        "phone",
        "email",
        "location",
        "education",
        "cgpa",
        "year_passed",
        "gmat",
        "course_prep",
        "curnt_work",
        "commit_ft",
        "sk_python",
        "sk_sql",
        "sk_java",
        "sk_analyticalskill",
        "sk_prblmsolving",
        "sk_engprof",
        "hckr_rnk",
        "hobbies",
        "linkedin_url",
        "github_url",
        "resume",
        "coverletter",
        "father_occ",
        "mother_occ",
        "income",
        "review",
      ],
      order: [["createdAt", "DESC"]],
      offset: skip,
      limit: limit,
    });

    if (studentData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "student data"));
    }

    return send(res, RESPONSE.SUCCESS, studentData);
  } catch (error) {
    console.log("List student", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
