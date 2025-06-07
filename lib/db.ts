import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI! ;

if(!MONGODB_URI){
    throw new Error("Please define mongodb uri in env file")
}

let cached = (global as any).mongoose ;

if(!cached){
    cached = (global as any).mongoose = {
        conn : null ,
        promise : null
    }; 
}

export async function connectToDatabase(){
    if(cached.conn){
        return cached.conn ;
    }
    if(!cached.promise){
        const opts = {
            
            bufferCommands: true ,
            maxPoolSize: 10
        }
        cached.promise = mongoose
            .connect(MONGODB_URI ,opts)
            .then(() => mongoose.connection)
    }
    try{
        cached.conn = await cached.promise ;
    }catch(error){
        cached.promise = null ;
        throw new Error("Check database file");
    }

    return cached.conn ;
}

// buffer command (MONGODB_URI, opts)

// It is mechanism through which it allows the 
// user to interact with our mongoose models even 
// before the connection with our db has been 
// fully established. It is used to improve the 
// user experience by preventing our application 
// from throwing errors or blocking while it's 
// trying to connect.