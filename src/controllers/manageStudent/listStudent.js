import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initstudentModel from "../../models/studentModel.js";
import { ROLE, STATE } from "../../config/constants.js";

import initbatchModel from "../../models/batchModel.js";
import { Op } from "sequelize";
import initaccountModel from "../../models/accountModel.js";
import initinterviewModel from "../../models/interviewModel.js";
import initexamModel from "../../models/examModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    let query = {
      isactive: STATE.ACTIVE,
    };

    if (req.user.role == ROLE.STUDENT) {
      query.student_id = req.user.id;
    } else {
      req.query.student_id ? (query.student_id = req.query.student_id) : "";
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const studentModel = await initstudentModel();
    const batchModel = await initbatchModel();
    const accountModel = await initaccountModel();
    const interviewModel = await initinterviewModel();
    const examModel = await initexamModel();

    req.query.searchkey
      ? (query.name = {
          [Op.iLike]: `%${req.query.searchkey}%`,
        })
      : "";

    //batch_id is mandatory while using this api as search inside batch
    req.query.batch_id ? (query.batch_id = req.query.batch_id) : "";

    req.query.current_state
      ? (query.current_state = req.query.current_state)
      : "";

    let studentData = await studentModel.findAll({
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          attributes: ["batch_id", "name"],
        },
        {
          model: examModel,
          as: "examInfo",
          attributes: ["exam_id", "exam_datetime", "exam_result", "exam_marks"],
          required: false,
        },
        {
          model: interviewModel,
          as: "interviewInfo",
          attributes: ["interview_id", "int_datetime", "int_result"],
          required: false,
        },
        {
          model: accountModel,
          as: "reviewerInfo",
          attributes: ["account_id", "name", "phone", "email"],
          required: false,
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
        "father_occ",
        "mother_occ",
        "income",
        "profile",
        "comment",
        "current_state",
        "batch_state",
        "dnc_state",
        "registered_on",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      offset: skip,
      limit: limit,
    });

    if (studentData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "student data"));
    }

    studentData = studentData.map((itm) => {
      return {
        ...itm.toJSON(),
        resume: "/document/" + itm.resume,
        profile: "/document/" + itm.profile,
      };
    });

    const totalCount = await studentModel.count({ where: query });

    return send(res, RESPONSE.SUCCESS, {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      studentData,
    });
  } catch (error) {
    console.log("List student", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
