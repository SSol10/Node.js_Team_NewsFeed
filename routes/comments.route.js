const {getComment,createComment,modifyComment,deleteComment} =require("../controllers/comments.js");
const {authMiddleware} =require("../middleware/auth_middleware.js");
const express = require("express");
const router = express.Router();


router.get("/comments",getComment); 
router.post("/comments",createComment);//auth
router.put("/:commentId",modifyComment);//auth
router.delete("/:commentId",deleteComment);//auth

module.exports = router;