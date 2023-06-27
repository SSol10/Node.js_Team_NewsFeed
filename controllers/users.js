const email_validation_check = require("../utils/email_validation");
const pw_validation_check = require("../utils/password_validation");
const { Users } = require("../models");

//회원가입
module.exports = async (req, res) => {
  try {
    const { EMAIL, PASSWORD, CONFIRM_PASSWORD, NICKNAME, NAME, USER_TMI } =
      req.body;
    if (!email_validation_check(EMAIL)) {
      console.log(!email_validation_check(EMAIL));
      return res
        .status(412)
        .json({ message: "이메일 형식이 일치하지 않습니다" });
    } else if (!pw_validation_check(PASSWORD)) {
      return res
        .status(412)
        .json({ message: "패스워드 형식이 일치하지 않습니다" });
    } else if (PASSWORD !== CONFIRM_PASSWORD) {
      return res.status(412).json({ message: "패스워드가 일치하지 않습니다" });
    }

    await Users.create({ EMAIL, PASSWORD, NICKNAME, NAME, USER_TMI });
    res.status(200).json({ message: "회원가입이 성공적으로 완료되었습니다" });
  } catch (err) {
    console.log(err);
    if (err.code === 100) {
      return res.status(412).json({ message: "중첩된 이메일이 존재합니다" });
    } else if (err.code === 101) {
      return res.status(412).json({ message: "중첩된 닉네임이 존재합니다" });
    }
    return res.status(500).json({ message: "회원가입에 실패하였습니다." });
  }
};
