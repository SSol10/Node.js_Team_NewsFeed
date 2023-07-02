const express = require("express");
const router = express.Router();
const { Posts, HashTags, Posts_Tags, Users, Likes } = require("../models");
const authMiddleware = require("../middleware/auth_middleware");
const db = require("../models");
const { Op } = require("sequelize");
const memberchecker = require("../middleware/memberChecker");
const {prepareDataForClient} = require("../controllers/posts.js")
const {searchHashTag} = require("../controllers/hashTag.js")

router
    .route("/")
    .get(memberchecker, async (req, res) => {
        const { userId } = res.locals.user;
        pageSize = (req.query.pageSize ? req.query.pageSize : 10)/1;
        pageNum = (req.query.pageNum ? req.query.pageNum : 1)/1;
        if(isNaN(pageSize)||isNaN(pageNum)){
            return res.status(412).json({errorMessage: "잘못된 페이지넘버입니다"})
        }

        try {
            const posts = await Posts.findAll({
                attributes: [
                    "postId",
                    "userId",
                    "postTitle",
                    "postContent",
                    "viewCount",
                    "createdAt",
                ],
                // posts.findall 통해 모든 게시글을 찾겠다 그 후 attridutes 사용
                include: {
                    model: Users,
                    attributes: ["nickname"],
                },
                // order을 통해 데이터를 내림차순으로 정렬, 혹은 오름차순으로 정렬
                order: [["viewCount", "desc"]],
                limit:pageSize,
                offset:(pageNum-1)*pageSize,
                raw: true,
                nest: true,
            });

            if (!posts.length) {
                return res.status(404).json({
                    errorMessage: "게시글 조회에 실패하셨습니다.",
                });
            }
            const postsData = await prepareDataForClient(userId,posts);

            return res.status(200).json({
                pageNum,
                pageSize,
                contentNum:posts.length,
                posts: postsData,
            });
        } catch (err) {
            console.error(`GET /api/posts error message: ${err}`);
            return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다" });
        }
    })
    .post(
        async (req, res, next) => {
            await authMiddleware(["userId"], req, res, next);
        },
        async (req, res) => {
            // { hashtag: [array] }도 res에 추가하기
            const { postTitle, postContent } = req.body;
            const { userId } = res.locals.user;

            const parseHashtag = (hashtag) => {
                if (!hashtag) {
                    return;
                }
                return hashtag.trim().split(",");
            };

            if (!postTitle || !postContent) {
                return res
                    .status(412)
                    .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
            }

            if (postTitle.trim() === "") {
                return res.status(412).json({
                    message: "게시글 제목의 형식이 일치하지 않습니다.",
                });
            }
            if (postContent.trim() === "") {
                return res.status(412).json({
                    errorMessage: "게시글 내용의 형식이 일치하지 않습니다.",
                });
            }

            try {
                //포스트아이디 생성 후
                await db.sequelize.transaction(async (transaction) => {
                    const post = await Posts.create(
                        {
                            userId: Number(userId),
                            postTitle,
                            postContent,
                            // hashtag 어떻게 넣을지 확인
                        },
                        { transaction }
                    );
                    const postId = post.postId;

                    const hashTags = await postContent.match(/#[\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]{1,18}/g); //#과 문자열로 이루어진 배열 반환
                    if (hashTags) {
                        const returnedHashTagArray = await HashTags.bulkCreate(
                            hashTags.map((hashTag) => {
                                return { tagContent: hashTag };
                            }),
                            { ignoreDuplicates: true, transaction,raw:true,nest:true}
                        );

                        for (let index = 0; index < hashTags.length; index++) {
                            const tagIdFindNull =
                                returnedHashTagArray[index].tagId;
                            if (tagIdFindNull === null) {
                                const hashTag = hashTags[index];
                                const tagForFind = await HashTags.findOne({
                                    where: { tagContent: hashTag },
                                    attributes: ["tagId"],
                                    transaction,
                                });
                                const tagIdForFind = tagForFind.tagId;
                                hashTags[index] = { tagId: tagIdForFind };
                            } else {
                                hashTags[index] = {
                                    tagId: returnedHashTagArray[index].tagId,
                                };
                            }
                        } //태그아이디를 hashTags에 저장하는 구문
                        const postsTags = await Posts_Tags.bulkCreate(
                            hashTags.map((tag) => {
                                return { postId: postId, tagId: tag.tagId };
                            }),
                            { transaction }
                        );
                    }

                    return res.status(201).json({
                        message: "게시글 작성에 성공하였습니다.",
                        posts: {
                            userId,
                            postTitle,
                            postContent,
                        },
                    });
                });
            } catch (err) {
                console.log(err)
                // console.error(`POST /api/posts error message: ${err}`);
                return res
                    .status(400)
                    .json({ errorMessage: "게시글 수정에 실패하였습니다" });
            }
        }
    );
router.get("/hashTagSearch",memberchecker,searchHashTag)

router
    .route("/:postId")
    .get(memberchecker, async (req, res) => {
        const { postId } = req.params;
        const { userId } = res.locals.user;

        if (!postId) {
            return res
                .status(400)
                .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        try {
            //
            const result = await Posts.findByPk(Number(postId), {
                include: {
                    model: Users,
                    attributes: ["nickname"],
                },
                raw: true,
                nest: true,
            });
            if (result) {

                await Posts.update(
                    { viewCount: Number(result.viewCount) + 1 },
                    {
                        where: {
                            postId: Number(postId),
                        },
                    }
                );

                const likesCount = await Likes.count({
                    where: {
                        postId: Number(postId),
                    },
                });

                let userHasClicked = null;
                if (userId) {
                    userHasClicked = await Likes.findOne({
                        where: {
                            [Op.and]: [
                                { userId: Number(userId) },
                                { postId: Number(postId) },
                            ],
                        },
                    });
                }

                if (!userHasClicked) userHasClicked = false;
                else userHasClicked = true;

                return res.status(200).json({
                    result: {
                        title: result.postTitle,
                        nickname: result.User.nickname,
                        content: result.postContent,
                        viewCount: Number(result.viewCount) + 1,
                        likesCount: Number(likesCount),
                        clicked: userHasClicked,
                        createdAt: result.createdAt,
                        updatedAt: result.updatedAt,
                    },
                });
            } else {
                return res
                    .status(400)
                    .json({ errorMessage: "게시글 조회에 실패하였습니다." });
            }
        } catch (err) {
            console.error(`GET /api/posts/:id Error Message: ${err}`);
            return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다" });
        }
    })
    .delete(
        async (req, res, next) => {
            await authMiddleware(["userId"], req, res, next);
        },
        async (req, res) => {
            const { postId } = req.params;
            const { userId } = res.locals.user;
            // const { nickname } = res.locals.user;

            if (!postId) {
                res.status(400).json({
                    errorMessage: "데이터 형식이 올바르지 않습니다.",
                });
            } else {
                try {
                    const postDeletedCount = await Posts.destroy({
                        where: {
                            postId: Number(postId),
                            userId: Number(userId),
                        },
                        force: true,
                    });
                    if (!postDeletedCount) {
                        return res.status(403).json({
                            errorMessage:
                                "게시글을 삭제할 권한이 존재하지 않습니다.",
                        });
                    }
                    return res
                        .status(200)
                        .json({ message: "게시글을 삭제하였습니다." });
                } catch (err) {
                    console.error(
                        `DELETE /api/posts/:id Error Message: ${err}`
                    );
                    return res
                        .status(400)
                        .json({ errorMessage: "게시글 삭제에 실패하였습니다" });
                }
            }
        }
    );
router.route("/:postId").put(
    async (req, res, next) => {
        await authMiddleware(["userId"], req, res, next);
    },
    async (req, res) => {
        try {
            const { postId } = req.params;
            const { postTitle, postContent } = req.body;
            const { userId } = res.locals.user;
            const hashTags = postContent.match(/#[\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]{1,18}/g);
            const post = await Posts.findByPk(Number(postId));
            if (post.userId !== userId) {
                return res
                    .status(412)
                    .json({ errorMessage: "수정권한이 존재하지 않습니다" });
            }
            else if (isNaN(postId / 1)) {
                return res
                    .status(412)
                    .json({ errorMessage: "잘못된 게시글 URL입니다" });
            }
            else if (!postTitle || !postContent) {
                return res.status(412).json({
                    errorMessage: "게시글 또는 제목이 입력되지 않았습니다",
                });
            }

            if (!post) {
                return res
                    .status(412)
                    .json({ errorMessage: "게시글을 찾을 수 없습니다." });
            }
            db.sequelize.transaction(async (transaction) => {
                await post.update({ postTitle, postContent }, { transaction });
                await Posts_Tags.destroy({ where: { postId }, transaction });
                if (hashTags) {

                    const bulkHashTag = hashTags.map((tag) => {
                        return { tagContent: tag };
                    });
                    await HashTags.bulkCreate(bulkHashTag, {
                        ignoreDuplicates: true,
                        transaction,
                    });

                    const tagFind = await HashTags.findAll({
                        where: {
                            tagContent: { [Op.or]: hashTags },
                        },
                        attributes: ["tagId"],
                        transaction,
                    }); //bulkcreate를 한 후 수행하는게 효율적
                    await Posts_Tags.bulkCreate(
                        tagFind.map((tag) => {
                            return { postId, tagId: tag.tagId };
                        }),
                        { transaction }
                    );
                }
                return res
                .status(200)
                .json({ message: "정상적으로 수정되었습니다" });
            });
        } catch (err) {
            console.log(err);
            return res
                .status(400)
                .json({ errorMessage: "게시글 수정에 실패하였습니다" });
        }
    }
);
module.exports = router;
