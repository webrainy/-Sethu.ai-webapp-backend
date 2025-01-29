import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { Op } from "sequelize";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const batch_id = req.query.batch_id;
    const { name } = req.body;

    let batchModel = await initbatchModel();

    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    if (name || name != undefined) {
      let isBatchExists = await batchModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          name: name,
          batch_id: { [Op.ne]: batch_id },
        },
      });

      if (isBatchExists) {
        return send(
          res,
          setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this batch")
        );
      } else {
        await batchModel.update(
          { name },
          {
            where: { batch_id: batch_id },
          }
        );
      }
    }
    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create batch", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
