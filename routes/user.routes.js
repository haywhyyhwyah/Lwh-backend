const express = require('express')
const router = express.Router()
const { postSignup, getDashboard, verifyToken, getQuestions, postSignin, postResult, getResults } = require('../controllers/user.controller')

router.post("/signup", postSignup)
router.post("/signin", postSignin)
router.get("/dashboard", verifyToken, getDashboard)
router.get("/questions", getQuestions)
router.post("/results", verifyToken, postResult)
router.get("/results", verifyToken, getResults)

module.exports = router