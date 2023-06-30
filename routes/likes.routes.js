const express = require("express");
const router = express.Router();
const { Likes } = require("../models");
const { Op } = require("sequelize");
// const authMiddleware = require("../security/auth-middleware");

// router.use(authMiddleware);

router
    .route("/:postId")
    .post(
        async (req, res, next) => {
            await authMiddleware(["userId"], req, res, next);
        },
        async (req, res) => {
            const { postId } = req.params;
            // const { userId } = req.body; // 이 부분은 사용자 인증이 추가되면 res.locals.user를 이용해야 함
            const { userId } = res.locals.user;

            if (!userId) {
                return res.status(403).json({
                    errorMessage: "Permission denied",
                });
            }

            try {
                // 유저가 좋아요 버튼 누른 적 있는지 확인
                const userHasClicked = await Likes.findOne({
                    where: {
                        [Op.and]: [
                            { userId: Number(userId) },
                            { postId: Number(postId) },
                        ],
                    },
                });

                // 좋아요를 누른 적 있는 사람이 다시 누르면 비정상적인 접근으로 판단
                if (userHasClicked) {
                    return res
                        .status(401)
                        .json({ errorMessage: "비정상적인 접근입니다." });
                }
                // 인증 미들웨어에서 사용자에 대한 파악을 하지만 여기서 한 번 더 사용자에 대한 확인을 하는 것이 좋을까?
                await Likes.create({
                    userId: Number(userId),
                    postId: Number(postId),
                });
                // 포스트에 의존적이니 포스트가 있는지 없는지 확인하는 작업은 필요 없겠지?
                const likesCount = await Likes.count({
                    where: {
                        postId: Number(postId),
                    },
                });

                return res.status(200).json({
                    data: {
                        likesCount: likesCount,
                        clicked: true,
                    },
                });
            } catch (err) {
                console.error(`GET /api/posts Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    )
    .delete(
        async (req, res, next) => {
            console.log("Athentication is required!");
            next();
        },
        async (req, res) => {
            const { postId } = req.params;
            const { userId } = req.body; // 인증 방식으로 바꿀 때 res.locals.user 이용

            try {
                const userHasClicked = await Likes.findOne({
                    where: {
                        [Op.and]: [
                            { userId: Number(userId) },
                            { postId: Number(postId) },
                        ],
                    },
                });
                // 인증된 사용자가 하트를 누른 적이 있는지 확인
                // 좋아요 누른 적도 없는 사람이 누르려고 하면 비정상적인 접근으로 판단
                if (!userHasClicked) {
                    return res
                        .status(401)
                        .json({ errorMessage: "비정상적인 접근입니다." });
                }

                await Likes.destroy({
                    where: {
                        [Op.and]: [
                            { userId: Number(userId) },
                            { postId: Number(postId) },
                        ],
                    },
                });

                const likesCount = await Likes.count({
                    where: {
                        postId: Number(postId),
                    },
                });

                return res.status(200).json({
                    likesCount: likesCount,
                    clicked: false,
                });
            } catch (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ errorMessage: "Internal Server Error" });
            }
        }
    );

module.exports = router;
