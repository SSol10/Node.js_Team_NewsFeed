const {
    getComment,
    createComment,
    modifyComment,
    deleteComment,
} = require("../controllers/comments.js");
const authMiddleware = require("../middleware/auth_middleware.js");
const express = require("express");
const router = express.Router();

router.get("/:postId/comments", getComment);
router.post(
    "/:postId/comments",
    async (req, res, next) => {
        await authMiddleware(["userId"], req, res, next);
    },
    createComment
); //auth
router.put(
    "/:postId/:commentId",
    async (req, res, next) => {
        await authMiddleware(["userId"], req, res, next);
    },
    modifyComment
); //auth
router.delete(
    "/:postId/:commentId",
    async (req, res, next) => {
        await authMiddleware(["userId"], req, res, next);
    },
    deleteComment
); //auth

module.exports = router;
