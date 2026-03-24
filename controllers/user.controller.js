const bcrypt = require('bcryptjs')

const saltRounds = 10

const nodeMailer = require('nodemailer')

const User = require('../models/user.models')
const Question = require('../models/question.models')
const Result = require('../models/result.models')

const jwt = require('jsonwebtoken')



const postSignup = (req, res) => {
    const { FirstName, LastName, email, password } = req.body;

    const userRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!userRegex.test(password)) {
        return res.status(400).send('Password must be at least 8 characters long, contain uppercase, lowercase, a nmber, and a special character')
    }

    User.findOne({ email })
        .then((existinguser) => {
            if (existinguser) {
                res.status(400).send('Email already exists');
                return Promise.reject('User already exists')
            }
            return bcrypt.hash(password, saltRounds);
        })

        .then((hashedPassword) => {
            if (!hashedPassword) return;

            const newUser = new User({
                FirstName,
                LastName,
                email,
                password: hashedPassword
            })


            return newUser.save();
        })

        .then((savedUser) => {
            if (!savedUser) return;
            res.status(201).json({ success: true, message: 'user registered successfully' })

        }).catch((err) => {
            console.log(err, 'User not saved')
        })
}


const postSignin = (req, res) => {
    const { email, password } = req.body

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.status(400).send('Invalid Credentials')
                return null;
            }
            console.log(user)
            return bcrypt.compare(password, user.password)

                .then((isMatch) => {
                    if (!isMatch) {
                        res.status(400).send('Invalid credentials')
                        return null;
                    }

                    return 'success';
                    // console.log('Login successful');
                })
                .then((status) => {
                    if (status === 'success') {
                        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24hr" })
                        res.status(200).json({
                            message: "Login successful",
                            success: true,
                            token,
                            user: {
                                id: user._id,
                                firstName: user.FirstName,
                                lastName: user.LastName,
                                email: user.email
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

    if(!token) return res.status(403).send('A token is required')
        

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
        } catch(err){
            return res.status(403).send('Invalid or expired token')
        }

        return next();
}


const getDashboard = (req, res) => {
    User.find()
    .then((users) => {
        res.json(users);
        console.log(users)
    }).catch((err) => {
        res.status(500).json({messsage: err.message})
    })
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

const postResult = async (req, res) => {
    try {
        const user = req.user || {}
        const { subject, score, total, answers } = req.body

        if (!subject || typeof score !== 'number' || typeof total !== 'number') {
            return res.status(400).json({ message: 'subject, score, and total are required' })
        }

        const result = new Result({
            userId: user.id,
            userEmail: user.email,
            subject,
            score,
            total,
            answers: Array.isArray(answers) ? answers : []
        })

        const savedResult = await result.save()
        return res.status(201).json({ message: 'Result saved', result: savedResult })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Could not save result', error: err.message })
    }
}

const getResults = async (req, res) => {
    try {
        const user = req.user || {}
        const query = user.id ? { userId: user.id } : {}
        const results = await Result.find(query).sort({ createdAt: -1 })
        return res.status(200).json({ results })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Could not fetch results', error: err.message })
    }
}

module.exports = { postSignup, postSignin, getDashboard, verifyToken, getQuestions, postResult, getResults }