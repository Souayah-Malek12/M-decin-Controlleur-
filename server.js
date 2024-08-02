const express = require("express")
const app = express();
const dotenv = require("dotenv")
const cors = require("cors")
const {connectDb} = require("./config/DbConfig")

app.use(express.json())
dotenv.config();
app.use(cors());

//DataBase Connection 
connectDb();


const PORT = process.env.PORT;

//Starting server 
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
});

// Routes 
app.use('/authen', require("./routes/authenRoutes"));
app.use('/user', require("./routes/userRoutes"));


// Testing server 
app.use("/", (req, res)=> {
    return res.status(200).send(" <h1>Home Page</h1>")
})


