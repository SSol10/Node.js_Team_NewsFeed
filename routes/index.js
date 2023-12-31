const express = require("express");
const router = express.Router();

const loginRouter = require("./auth.route.js");
const userRouter = require("./users.route.js");
const postRouter = require("./posts.route.js");
const likeRouter = require("./likes.route.js");
const commentRouter = require("./comments.route.js");

// 로그인 api/login
// 회원가입 api/signup
router.use("/login", loginRouter);
router.use("/user", userRouter);
router.use("/likes", likeRouter);
router.use("/posts", postRouter);
router.use("/posts", commentRouter);

//router.use("/post/:postId/comment")

module.exports = router;
