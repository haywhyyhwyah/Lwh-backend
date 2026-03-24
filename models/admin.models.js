const mongoose = require("mongoose")


let adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        match: [/^[A-Za-z]+$/, "First name must contain only letters"],
        trim: true,
    },

    lastName: {
        type: String,
        required: [true, "Last name is required"],
        match: [/^[A-Za-z]+$/, "Last name must contain only letters"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email has been taken, please choose another one"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String
    }
})


module.exports = mongoose.model("Admin", adminSchema)