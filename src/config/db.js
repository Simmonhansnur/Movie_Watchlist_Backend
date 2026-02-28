import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log:
        process.env.NODE.ENV == "development" 
          ? ["query" , "error" ,"warn"]
          : ["error"]

});

const connectDb = async () =>{
    try{
        await prisma.$connect();
        console.log("Db connected to prisma");
    }catch(error){
        console.error(`Db connection error: ${error.message}`);
        process.exit(1);
    }
};

const disconnectDb = async () =>{
        await prisma.$disconnect();
};

export {prisma,connectDb,disconnectDb};