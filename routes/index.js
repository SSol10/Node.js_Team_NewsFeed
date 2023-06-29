const express = require('express');
const router = express.Router();


const loginRouter =require("./auth.route.js");
const signupRouter = require("./users.route.js");
const postRouter = require("./posts.route.js");
const commentRouter = require("./comments.route.js")

// 로그인 api/login
// 회원가입 api/signup
router.use("/login",loginRouter);  
router.use("/signup",signupRouter);
router.use("/posts", postRouter);
router.use("/posts/:postId/comments",commentRouter)

//router.use("/post/:postId/comment")



module.exports = router;