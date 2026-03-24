const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userEmail: { type: String, required: false },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Result', resultSchema)
