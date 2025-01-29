import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import authenticate from "../../middlewares/authenticate.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const { name } = req.body;

    let batchModel = await initbatchModel();

    if (name == "" || name == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
    }

    let isBatchExists = await batchModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        name,
      },
    });

    if (isBatchExists) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this batch")
      );
    }

    await batchModel.create({
      ...req.body,
    });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create batch", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
