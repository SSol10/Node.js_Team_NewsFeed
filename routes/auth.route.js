const express = require("express");
const router = express.Router();

const loginMiddleware = require("../controllers/login.js")

module.exports=router.post("/",loginMiddleware)