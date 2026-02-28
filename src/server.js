import express from "express";
import {config} from "dotenv";
import { connectDb, disconnectDb } from "./config/db.js";
import morgan from "morgan";
import { authLimiter } from "./middleware/rateLimiter.js";




//import routes
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import watchlistRoutes from './routes/watchListRoutes.js';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

config();
console.log("ENV CHECK:", process.env.DATABASE_URL);

connectDb();

const app = express();

//Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//Monitoring
app.use(morgan("dev"));
//validate Request


//API routes
app.use("/movies",movieRoutes);
app.use("/auth",authLimiter,authRoutes);
app.use("/watchlist",watchlistRoutes);

app.use(notFound);
app.use(errorHandler);

app.get("/hello",(req,res) => {
    res.json({message : "Hello world"});
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    
});




//handle unhandled promise rejection (eg :- DB connection error)
process.on("unhandledRejection",(err) =>{
    console.error("unhandled Rejection",err);
    server.close(async () =>{
        await disconnectDb();
        process.exit(1);
    });
});


//handle uncaught exception
process.on("uncaughtException", async (err) =>{
    console.error("uncaught Exception",err);
        await disconnectDb();
        process.exit(1);
});


//Graceful shutdown
process.on("SIGTERM",async () =>{
    console.log("SIGTERM recieved ,shutting down gracedfully");
    server.close(async () =>{
        await disconnectDb();
        process.exit(1);
    });
});