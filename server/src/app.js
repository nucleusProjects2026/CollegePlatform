import express from 'express'
import dotenv from 'dotenv'

dotenv.config()


const app=express()

app.listen(process.env.PORT || 5000 ,()=>{
    console.log(`the server started on PORT ${process.env.PORT || 5000} `)
})
