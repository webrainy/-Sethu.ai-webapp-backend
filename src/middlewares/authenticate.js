import jwt from "jsonwebtoken";
import { RESPONSE } from "../config/global.js";
import { send } from "../helper/responseHelper.js";

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return send(res, RESPONSE.ACCESS_DENIED);
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return send(res, RESPONSE.INVALID_TOKEN);
  }
  return next();
};

export default authenticate;
