const express = require('express')
const router = express.Router()
const { postAdminSignup, postAdminSignin, postQuestion, postQuestionBatch, getQuestions, getDashboard, verifyToken } = require('../controllers/admin.controller')

router.post('/signup', postAdminSignup)
router.post('/signin', postAdminSignin)
router.get('/dashboard', getDashboard, verifyToken)


router.post('/questions', postQuestion)
router.post('/questions/batch', postQuestionBatch)
router.get('/questions', getQuestions)

module.exports = router