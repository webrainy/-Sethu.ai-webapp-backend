import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";

const route = Router();

export default route.post("/", authenticate, async (req, res) => {
    try {
      
  } catch (error) {}
});
