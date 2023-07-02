const express = require("express");
const router = express.Router();
const {signUp,userInfo,passwordModify} = require("../controllers/users.js");
const authMiddleware = require("../middleware/auth_middleware.js");


router.post("/signUp",signUp);
router.get("/",(req,res,next)=>{authMiddleware(["name", "nickname", "email", "TMI"],req,res,next)},userInfo);
router.put("/passwordModify",(req,res,next)=>{authMiddleware(["password","userId"],req,res,next)},passwordModify);
module.exports = router;