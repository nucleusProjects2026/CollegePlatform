import express from 'express'
import dotenv from 'dotenv'
import facultyRouter from './routes/faculty.route.js'
import connectDB from './config/database.js'

dotenv.config()


const app=express()

app.use('/api/v1/faculty', facultyRouter)

const startServer = async () => {
    try {
       // await connectDB()

        app.listen(process.env.PORT || 5000 ,()=>{
            console.log(`the server started on PORT ${process.env.PORT || 5000} `)
        })
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message)
        process.exit(1)
    }
}

startServer()
