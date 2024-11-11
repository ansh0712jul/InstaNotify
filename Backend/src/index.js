import dotenv from "dotenv"
import { app } from "./app.js";
import connectDB from "./db/index.js";
import monitorWebsites from "./utils/cronjobs.js";


dotenv.config({
    path:'./env'
})


// Start the cron job
monitorWebsites();
//database connection 
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8080,()=>{
        console.log(`server is listening at port : ${process.env.PORT}`)

    })
})
.catch((err)=> console.log('MongoDb connection failed!!',err))