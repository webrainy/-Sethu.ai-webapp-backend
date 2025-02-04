import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initEventModel from "../../models/eventModel.js";
import initbatchModel from "../../models/batchModel.js";
import initEventItm from "../../models/eventitmModel.js";
import initstudentmodel from "../../models/studentModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const event_type = req.query.event_type;

    let query = { isactive: STATE.ACTIVE };

    event_type ? (query.event_type = event_type) : "";

    const eventModel = await initEventModel();
    const eventItmModel = await initEventItm();

    const batchModel = await initbatchModel();
    const studentModel = await initstudentmodel();

    let batchEvents = await eventModel.findAll({
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          attributes: ["batch_id", "name"],
        },
        {
          model: eventItmModel,
          as: "eventInfo",
          attributes: ["event_id"],
          include: [
            {
              model: studentModel,
              as: "studentInfo",
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
                "current_state",
              ],
            },
          ],
        },
      ],
      where: query,
      attributes: [
        "event_id",
        "title",
        "datetime",
        "url",
        "event_type",
        "batch_id",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    if (batchEvents.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "batch events"));
    }

    return send(res, RESPONSE.SUCCESS, batchEvents);
  } catch (error) {
    console.log("list event", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
