const express = require('express') 
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config()
const URI = process.env.MONGO_URI
const port = process.env.PORT || 3000
app.use(express.urlencoded({extended:true}))
app.use(express.json())
const userRoutes = require('./routes/user.routes')
const adminRoutes = require('./routes/admin.routes')

const cors = require('cors')

app.use(cors({
    origin: "https://learn-with-haywhy.vercel.app",
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials: true
}))


app.use( '/user', userRoutes)
app.use( '/admin', adminRoutes)



mongoose.connect(URI)
.then(()=> {
    console.log('Connected to mongoDB');
})
.catch((err) => {
    console.log('Connection error', err);  
})









// app.listen(port, ()=>{console.log(`app is running on port ${port}`);
// })

module.exports = app;