const express = require('express');
const router = express.Router();

const loginRouter =require("./auth.route.js");
const signupRouter = require("./users.route.js");

// 로그인 api/login
// 회원가입 api/signup
router.use("/login",loginRouter);  
router.use("/signup",signupRouter);





module.exports = router;