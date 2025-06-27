import { Router } from "express";
import { send } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { STATE } from "../../config/constants.js";
import initstudentModel from "../../models/studentModel.js";
import { Op } from "sequelize";

const router = Router();

export default router.post("/", async (req, res) => {
  try {
    let studentModel = await initstudentModel();

    let students = await studentModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
        batch_id: { [Op.ne]: null },
      },
    });

    for (let i = 0; i < students.length; i++) {
      let latest = await studentModel.findOne({
        where: { isactive: STATE.ACTIVE, sequence: { [Op.ne]: null } },
        order: [["sequence", "DESC"]],
      });

      //   console.log("sequence", latest.sequence);

      let x = latest != null ? latest.sequence + 1 : 1;
      let formattedSeq = x.toString().padStart(2, "0");

      let rollno = `SSSSDP-D${formattedSeq}`;
      let sequence = latest != null ? latest.sequence + 1 : 1;

      await studentModel.update(
        //{ rollno: rollno, sequence: sequence },
        { rollno: null, sequence: null },

        {
          //   where: { student_id: students[0].student_id },
          where: { student_id: students[i].student_id },
        }
      );
    }

    // await studentModel.update(updates, {
    //   where: { student_id: student_id },
    // });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("Edit student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
