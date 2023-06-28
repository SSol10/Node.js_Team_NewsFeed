//댓글 생성삭제수정조회 기능구현
const { Comments } = require("../models");
const comments = require("../models/comments");

const createComment = async (req, res) => {
  const { commentContent } = req.body;
  const { postId } = req.params;
  const { userId } = req.locals.user;

  if (!commentContent) {
    return res.status(412).json({ message: "댓글 내용이 없습니다" });
  }

  await Comments.create(
    { userId, commentContent, postId },
    { returning: false }
  )
    .then((isSuccess) => {
      if (!isSuccess) {
        return res.status(400).json({ message: "댓글작성에 실패하였습니다" });
      }
      return res.status(201).json({ message: "댓글을 작성하였습니다" });
    })
    .catch((err) => {
      return res.status(400).json({ message: "댓글 작성에 실패하였습니다." });
    });
};

const getComment = async (req, res) => {
  const { postId } = req.params;
  const { commentPageNum, commentSize } = req.body;
  commentPageNum = req.query.commentPageNum ? req.query.commentPageNum : 1;
  commentSize = req.query.commentSize ? req.query.commentSize : 10;
  try {
    const comments = await Comments.findAll({
      where: { postId },
      limit: commentSize / 1,
      offset: (commentPageNum - 1) * commentSize,
      order: [["createdAt,DESC"]],
      attributes: [
        "commentContent",
        "createdAt",
        "userId",
        [Sequelize.literal("User.nickname"), "nickname"],
      ],
    });

    if (!comments) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다" });
    }

    return res.status(200).json({ comments: comments });
  } catch (err) {
    res.status(400).json({ message: "댓글 조회에 실패하였습니다" });
  }
};

const modifyComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { commentContent } = req.body;
    const user = req.locals;

    if (!commentContent) {
      return res.status(412).json({ message: "댓글 내용이 없습니다" });
    }

    const updateCommentCount = Comments.update(
      {
        userId: user.userId, //로그인한 유저와 정보가 일치하는지 확인
        commentId,
      },
      { commentContent }
    );
    if (!updateCommentCount) {
      return res
        .status(404)
        .json({ message: "댓글 수정 권한이 존재하지 않습니다" });
    }

    return res.status(200).json({ message: "댓글을 수정하였습니다" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "댓글 수정이 정상적으로 처리되지 않았습니다" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { user } = req.loclas;
    const deleteCount = Comments.destroy({
      where: { commentId, userId: user.userId },
    });
    if (!deleteCount) {
      return res.status(403).json({ message: "게시글 삭제 권한이 없습니다" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "댓글 삭제가 정상적으로 처리되지 않았습니다" });
  }
};

module.exports = { getComment, createComment, modifyComment, deleteComment };
