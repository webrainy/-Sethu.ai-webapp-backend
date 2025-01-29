import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initbatchModel from "../../models/batchModel.js";
import { ROLE, STATE } from "../../config/constants.js";
import initstudentmodel from "../../models/studentModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const batchModel = await initbatchModel();
    const studentModel = await initstudentmodel();

    let batchData = await batchModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
      },
      attributes: ["batch_id", "name"],

      includes: [
        {
          model: batchModel,
          as: "batchInfo",
          required: false,
        },
      ],
    });

    if (batchData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "student data"));
    }

    return send(res, RESPONSE.SUCCESS, batchData);
  } catch (error) {
    console.log(error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
