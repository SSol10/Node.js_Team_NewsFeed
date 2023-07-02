const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../models");
const tokenKey = "4joTuna";
const accessTokenExpiresIn = "1h";
const refreshTokenExpiresIn = "14d";

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({
      where: { email },
      attributes: ["password","userId"],
    });
    if (!user.password||!user) {
      //패스워드가 존재하지 않는경우 즉, email이 유효하지 않은경우
      return res
        .status(412)
        .json({ errorMessage: "이메일 또는 패스워드를 확인해주세요" });
    } else {

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {

        return res
          .status(412)
          .json({ errorMessage: "이메일 또는 패스워드를 확인해주세요" });
      }
      const accessToken = jwt.sign({ email }, tokenKey, {
        expiresIn: accessTokenExpiresIn,
      });
      const refreshToken = jwt.sign({}, tokenKey, {
        expiresIn: refreshTokenExpiresIn,
      });
      user.refreshToken = refreshToken;
      
      await user.save();
      res.cookie("Authorization", `Bearer ${accessToken}`);
      return res.status(200).json({ message: "로그인에 성공하였습니다" });
    }
  } catch (err) {
    console.log(err)
    res.status(412).json({ errorMessage: "로그인에 실패하였습니다" });
  }
};

