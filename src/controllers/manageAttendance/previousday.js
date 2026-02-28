import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initstudentmodel from "../../models/studentModel.js";
import initaccountModel from "../../models/accountModel.js";
import initAttendanceModel from "../../models/attendanceModel.js";
import initattendanceItm from "../../models/attendanceitmModel.js";
import moment from "moment";
import { Op } from "sequelize";
import { STATE } from "../../config/constants.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    let batch_id = req.query.batch_id;

    if (!batch_id) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    //  yesterday date
    let startOfDay = moment().subtract(1, "day").startOf("day");
    let endOfDay = moment().subtract(1, "day").endOf("day");

    let query = {
      isactive: STATE.ACTIVE,
      batch_id,
      datetime: {
        [Op.between]: [startOfDay, endOfDay],
      },
    };

    let itmQuery = { isactive: STATE.ACTIVE };

    if (req.query.attendance_type)
      query.attendance_type = req.query.attendance_type;

    if (req.query.attendance_status)
      itmQuery.attendance_status = req.query.attendance_status;

    const studentModel = await initstudentmodel();
    const accountModel = await initaccountModel();
    const attendanceModel = await initAttendanceModel();
    const attendanceItmModel = await initattendanceItm();

    let data = await attendanceModel.findAll({
      include: [
        {
          model: accountModel,
          as: "createdBy",
          attributes: ["account_id", "name", "phone", "email", "role"],
        },
        {
          model: attendanceItmModel,
          as: "attendanceInfo",
          where: itmQuery,
          attributes: ["att_id", "attendance_status"],
          include: [
            {
              model: studentModel,
              as: "studentInfo",
              attributes: [
                "student_id",
                "name",
                "phone",
                "email",
                "rollno",
                "current_state",
                "batch_state",
                "dnc_state",
                "registered_on",
                "selected_on",
              ],
            },
          ],
        },
      ],
      where: query,
      order: [["createdAt", "DESC"]],
    });

    if (!data.length) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "Previous Attendance"));
    }

    return send(res, RESPONSE.SUCCESS, data);
  } catch (err) {
    console.log("previous attendance error", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
