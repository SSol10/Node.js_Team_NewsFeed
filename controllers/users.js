const email_validation_check = require("../utils/email_validation");
const pw_validation_check = require("../utils/password_validation");
const { Users } = require("../models");
const bcrypt = require("bcrypt")

//회원가입
const signUp = async (req, res) => {
    try {
        const { email, password, confirmPassword, nickname, name, TMI } =
            req.body;
        if (!email_validation_check(email)) {
            return res
                .status(412)
                .json({ message: "이메일 형식이 일치하지 않습니다" });
        } else if (!pw_validation_check(password)) {
            return res
                .status(412)
                .json({ message: "패스워드 형식이 일치하지 않습니다" });
        } else if (password !== confirmPassword) {
            return res
                .status(412)
                .json({ message: "패스워드가 일치하지 않습니다" });
        }

        await Users.create({ email, password, nickname, name, TMI });
        return res.status(200).json({
            message: "회원가입이 성공적으로 완료되었습니다",
        });
    } catch (err) {
        if (err.message === "Validation error: 100") {
            return res
                .status(412)
                .json({ message: "중첩된 이메일이 존재합니다" });
        } else if (err.message === "Validation error: 101") {
            return res
                .status(412)
                .json({ message: "중첩된 닉네임이 존재합니다" });
        }
        return res.status(400).json({ message: "회원가입에 실패하였습니다." });
    }
};

const userInfo = async (req, res) => {
    const userInfo = res.locals.user;
    try {

        if (!userInfo) {
            return res
                .status(412)
                .json({ message: "유저정보를 반환할 수 없습니다" });
        }
        return res.status(200).json({
            message: "정상적으로 유저 정보가 반환되었습니다",
            userInfo,
        });
    } catch (err) {
        return res
            .status(400)
            .json({ message: "유저정보를 반환할 수 없습니다" });
    }
};

const passwordModify = async (req, res) => {
    const {oldPassword,password,confirmPassword} = req.body;
    const user =res.locals.user;
    try{
        if(password!==confirmPassword){
            return res.status(412).json({errorMessage:"비밀번호를 확인해주세요"})
        }else if(!pw_validation_check(password)){
            return res.status(412).json({errorMessage:"패스워드 형식이 일치하지 않습니다"})
        }else if(oldPassword===password){
            return res.status(412).json({errorMessage:"이전과 동일한 패스워드는 사용할 수 없습니다"})
        }
        const isValidPassword = bcrypt.compareSync(oldPassword,user.password);
        if(!isValidPassword){
            return res.status(412).json({errorMessage:"패스워드가 일치하지 않습니다"})
        }
        user.password = password;
        await user.save();
        return res.status(200).json({message:"패스워드 변경에 성공하였습니다"})
    }catch(err){
        console.log(err)
        return res.status(412).json({errorMessage:"패스워드 변경에 실패하였습니다"})
    }
};

module.exports = { signUp, userInfo,passwordModify };
