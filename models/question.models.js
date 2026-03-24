const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    question: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correct: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    explanation: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Question', questionSchema)
