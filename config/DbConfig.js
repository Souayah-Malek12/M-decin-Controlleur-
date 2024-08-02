const mongoose = require("mongoose");
const dotenv =require("dotenv")

dotenv.config();

const CONN_URL = process.env.CONN_URL;

const connectDb = async()=> {
    try{
        await mongoose.connect(CONN_URL);
        console.log(`Connected to database successfully ${mongoose.connection.host}` )
    }catch(error){
        console.log("Database connection error ");
    }
}

module.exports = {connectDb}