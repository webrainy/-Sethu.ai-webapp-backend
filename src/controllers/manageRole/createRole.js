import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { HASH_ROUND, ROLE, STATE } from "../../config/constants.js";
// import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import initaccountModel from "../../models/accountModel.js";
import initstudentmodel from "../../models/studentModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { resendMail } from "../../middlewares/resend.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    const { name, phone, email, password } = req.body;
    let role;
    req.query.role == ROLE.SUB_ADMIN
      ? (role = ROLE.SUB_ADMIN)
      : (role = ROLE.REVIEWER);

    let accountModel = await initaccountModel();
    let studentModel = await initstudentmodel();

    if (name == "" || name == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
    }
    if (phone == "" || phone == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "phone"));
    }
    if (email == "" || email == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "email"));
    }
    if (password == "" || password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
    }

    const emailPattern = String(email).match(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    );

    if (!emailPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Email"));
    }

    const pPattern = String(phone).match(/^\+\d{10,15}$/);
    if (!pPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Phone"));
    }

    const pwdPattern = String(password).match(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/
    );
    if (!pwdPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
    }

    let isphoneExist = await accountModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        phone,
      },
    });

    let isemailExist = await accountModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        email,
      },
    });

    let isStudentphoneExist = await studentModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        phone,
      },
    });

    let isStudentemailExist = await studentModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        email,
      },
    });

    if (isphoneExist || isStudentphoneExist) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this phone")
      );
    }
    if (isemailExist || isStudentemailExist) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this email")
      );
    }

    // const encryptedPassword = await bcrypt.hash(password, HASH_ROUND);
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.TOKEN_KEY
    ).toString();

   let admin= await accountModel.create({
      ...req.body,
      role: role,
      password: encryptedPassword,
      account: req.user.id,
    });

    let message = {
      subject: `Your Account Credentials for Sri Sathya Sai Skill Development Program`,

      text: `Dear ${name},

You have been added as a ${
        role == ROLE.REVIEWER ? "Reviewer" : "Admin"
      } in the Sri Sathya Sai Skill Development Program. Below are your login credentials:

👤 Username: ${email}
🔑 Temporary Password: ${password}

Please log in using the credentials above and change your password upon first login for security purposes.

If you have any questions or need assistance, feel free to reach out.

Best regards,
Program Coordinator
Sri Sathya Sai Skill Development Program
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
    };

    resendMail(admin, message);

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create account", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
