const bcrypt = require('bcryptjs')

const saltRounds = 10

const nodeMailer = require('nodemailer')

const Admin = require('../models/admin.models')
const Question = require('../models/question.models')

const jwt = require('jsonwebtoken')


const postAdminSignup = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const adminRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!adminRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long, contain uppercase, lowercase, a nmber, and a special character' })
    }

    Admin.findOne({ email })
        .then((existingadmin) => {
            if (existingadmin) {
                res.status(400).json({ message: 'Admin already exists' });
                return Promise.reject('Admin already exists')
            }
            return bcrypt.hash(password, saltRounds);
        })

        .then((hashedPassword) => {
            if (!hashedPassword) return;

            const newAdmin = new Admin({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: "admin"
            })

            return newAdmin.save();
        })


        .then((savedUser) => {
            if (!savedUser) return;
            console.log('Admin registered successfully');

            res.status(201).json({ success: true, message: 'Admin registered successfully' })

        }).catch((err) => {
            console.log(err, 'Admin not saved')
        })
}



const postAdminSignin = (req, res) => {
    const { email, password } = req.body

    Admin.findOne({ email })
        .then((admin) => {
            if (!admin) {
                res.status(400).json({message: 'Invalid credentials, Admin access only'})
                return null;
            }
            console.log(admin)
            return bcrypt.compare(password, admin.password)

                .then((isMatch) => {
                    if (!isMatch) {
                        res.status(400).json({message: 'Invalid credentials, Admin access only'})
                        return null;
                    }

                    return 'success'
                })



                .then((status) => {
                    if (status === 'success') {
                        console.log('logged in successfully')
                        const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "24hr" })
                        res.status(200).json({
                            message: "Login successful",
                            success: true,
                            token,
                            admin: {
                                id: admin._id,
                                firstName: admin.firstName,
                                lastName: admin.lastName,
                                email: admin.email,
                                role: admin.role
                            }
                        });
                    }
                })
                .catch((err) => {
                    console.error('Database or server error', err)
                    if (!res.headersSent) {
                        res.status(500).send("Internal server error")
                    }
                })
        })
}


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']

    if (!token) return res.status(403).send('A token is required')


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.admin = decoded
    } catch (err) {
        return res.status(403).send('Invalid or expired token')
    }

    return next();
}


const getDashboard = (req, res) => {
    Admin.find()
        .then((admin) => {
            res.json(admin);
            console.log(admin)
        }).catch((err) => {
            res.status(500).json({ messsage: err.message })
        })
}




const postQuestion = async (req, res) => {
    try {
        const { subject, question, optionA, optionB, optionC, optionD, correct, explanation } = req.body
        if (!subject || !question || !optionA || !optionB || !optionC || !optionD || !correct) {
            return res.status(400).json({ message: 'All required fields must be provided' })
        }

        const newQuestion = new Question({ subject, question, optionA, optionB, optionC, optionD, correct, explanation })
        const saved = await newQuestion.save()
        return res.status(201).json({ message: 'Question saved', question: saved })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Could not save question', error: err.message })
    }
}

const postQuestionBatch = async (req, res) => {
    try {
        const { subject, questions } = req.body
        if (!subject || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Subject and questions required' })
        }

        const docs = questions.map((q) => ({
            subject,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correct: q.correct,
            explanation: q.explanation || ''
        }))

        const saved = await Question.insertMany(docs)
        return res.status(201).json({ message: 'Batch saved', count: saved.length, questions: saved })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Could not save questions', error: err.message })
    }
}

const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 })
        return res.status(200).json({ questions })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Could not fetch questions', error: err.message })
    }
}

module.exports = { postAdminSignup, postAdminSignin, postQuestion, postQuestionBatch, getQuestions, verifyToken, getDashboard }