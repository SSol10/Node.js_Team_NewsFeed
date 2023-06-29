const express = require("express");
const router = express.Router();
const { Posts } = require("../models");
// const authMiddleware = require("../security/auth-middleware");

// router.use(authMiddleware);

router
    .route("/")
    .post(
        async (req, res, next) => {
            console.log("Middleware!!");
            next();
        },
        async (req, res) => {
            // { hashtag: [array] }도 res에 추가하기
            // console.log("POST");
            const { postTitle, postContent } = req.body;
            const { userId } = req.body; // 요거는 테스트용 후에 인증 미들웨어 사용하면 필요없음.
            const { hashtag } = req.body; // 해쉬태그 달 때 사용

            console.log(postTitle, postContent);
            const parseHashtag = (hashtag) => {
                if (!hashtag) {
                    return;
                }
                return hashtag.trim().split(",");
            };
            // const { nickname, _id } = res.locals.user;
            // const { title, content } = req.body;

            if (!postTitle || !postContent) {
                return res
                    .status(412)
                    .json({ message: "데이터 형식이 올바르지 않습니다." });
            }

            if (postTitle.trim() === "") {
                return res.status(412).json({
                    message: "게시글 제목의 형식이 일치하지 않습니다.",
                });
            }
            if (postContent.trim() === "") {
                return res.status(412).json({
                    message: "게시글 내용의 형식이 일치하지 않습니다.",
                });
            }

            try {
                await Posts.create({
                    userId: Number(userId),
                    postTitle,
                    postContent,
                    // hashtag 어떻게 넣을지 확인
                });
                return res.status(201).json({
                    message: "게시글 작성에 성공하였습니다.",
                    posts: {
                        userId,
                        postTitle,
                        postContent,
                        hashtag: parseHashtag(hashtag),
                    },
                });
            } catch (err) {
                console.error(`POST /api/posts error message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    );

router
    .route("/:id")
    .delete(async (req, res) => {
        const { id } = req.params;
        // const { nickname } = res.locals.user;

        if (!id) {
            res.status(400).json({
                message: "데이터 형식이 올바르지 않습니다.",
            });
        } else {
            try {
                const post = await Posts.findByPk(Number(id));

                if (!post) {
                    return res.status(400).json({
                        message: "게시글 조회에 실패하였습니다.",
                    });
                }

                // if (nickname !== post.user) {
                //     return res
                //         .status(403)
                //         .json({
                //             errorMessage:
                //                 "게시글을 삭제할 권힌이 존재하지 않습니다.",
                //         });
                // }

                await Posts.destroy({
                    where: {
                        postId: Number(id)
                    },
                    force: true
                });
                return res
                    .status(200)
                    .json({ message: "게시글을 삭제하였습니다." });
            } catch (err) {
                console.error(`DELETE /api/posts/:id Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    });

module.exports = router;
