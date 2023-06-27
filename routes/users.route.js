const express = require("express");
const router = express.Router();

const signupMiddleware = require("../controllers/users.js");

module.exports = router.post("/",signupMiddleware);