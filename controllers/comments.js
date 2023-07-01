//댓글 생성삭제수정조회 기능구현
const { Comments, Users } = require("../models");
const Sequelize = require("sequelize");

const createComment = async (req, res) => {
    const { commentContent } = req.body;
    const { postId } = req.params;
    const { userId } = res.locals.user;

    if (!commentContent) {
        return res.status(412).json({ message: "댓글 내용이 없습니다" });
    }

    await Comments.create(
        { userId, commentContent, postId },
        { returning: false }
    )
        .then((isSuccess) => {
            if (!isSuccess) {
                return res
                    .status(400)
                    .json({ message: "댓글작성에 실패하였습니다" });
            }
            return res.status(201).json({ message: "댓글을 작성하였습니다" });
        })
        .catch((err) => {
            console.log(postId);
            return res
                .status(400)
                .json({ message: "댓글 작성에 실패하였습니다." });
        });
};

const getComment = async (req, res) => {
    const { postId } = req.params;
    const commentPageNum = req.query.commentPageNum ? req.query.commentPageNum : 1;
    const commentSize = req.query.commentSize ? req.query.commentSize : 10;
    try {
        const comments = await Comments.findAll({
            where: { postId },
            limit: commentSize / 1,
            offset: (commentPageNum - 1) * commentSize,
            order: [["createdAt", "DESC"]],
            attributes: ["commentContent", "createdAt", "userId"],
            include: [
                {
                    model: Users,
                    attributes: ["nickname"],
                },
            ],
        });

        if (!comments.length) {
            return res
                .status(404)
                .json({ message: "게시글이 존재하지 않습니다" });
        }

        return res.status(200).json({ comments: comments });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "댓글 조회에 실패하였습니다" });
    }
};

    // 어떤 기능을 구현해야하는지 먼저 주석으로 처리하세요

    // 게시글 수정기능을 작성
    // 게시글 수정기능을 하려면
    // 유저로부터 정보를 받아서 게시판의 게시글 수정을 해야한다.

    // 유저로부터 받아올 정보 = title, content ,commentId ,userId
    // 1.댓글을 db에서 어떻게 찾을지, + 게시글을 찾았다면, 어떻게 수정할지

const modifyComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        console.log(commentId);
        const { commentContent } = req.body;
        const { userId } = res.locals.user;

        if (!commentContent) {
            return res.status(412).json({ message: "댓글 내용이 없습니다" });
        }

        const updateCommentCount = await Comments.update(
            { commentContent },
            {
                where: {
                    userId, //로그인한 유저와 정보가 일치하는지 확인
                    commentId,
                },
            }
        );
        if (!updateCommentCount) {
            return res
                .status(404)
                .json({ message: "댓글 수정 권한이 존재하지 않습니다" });
        }

        return res.status(200).json({ message: "댓글을 수정하였습니다" });
    } catch (err) {
        res.status(400).json({
            message: "댓글 수정이 정상적으로 처리되지 않았습니다",
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = res.locals.user;
        const deleteCount = await Comments.destroy({
            where: { commentId, userId },
        });
        if (!deleteCount) {
            return res
                .status(403)
                .json({ message: "게시글 삭제 권한이 없습니다" });
        }
        return res.status(200).json({message:"댓글 삭제가 정상적으로 처리되었습니다"})
    } catch (err) {
      console.log(err)
        res.status(400).json({
            message: "댓글 삭제가 정상적으로 처리되지 않았습니다",
        });
    }
};

module.exports = { getComment, createComment, modifyComment, deleteComment };
