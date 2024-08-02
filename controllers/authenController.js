const user = require("../models/userModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
require("dotenv").config();

const registreController = async(req, res) => {
    try{
        const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const {firstName, lastName, address, phoneNumber, role, establishment, email, password } = req.body;
        if( !firstName ||  !lastName ||  !address||  !phoneNumber || !role  || !email || !password ){
                return res.status(400).send({
                    success : false,
                    message: "Provide missed field(s)"
                })
        }
        if(!regex.tetst(email)){
            return res.status(400).send({
                success: false,
                message : "Enter a valid email format"
            })
        }
        const emailExist = await user.findOne({email});
        if(emailExist){
            return res.status(500).send({
                success : false,
                message: "email exist"
            })
        }
        if(!passwordStrengthRegex.test(password)){
            return res.status(400).send({
                success: false,
                message : "New password does not meet the strength requirements. It must be at least 8 characters long and include uppercase, lowercase letters, numbers, and special characters"
            })
        }

        var salt = await bcrypt.genSalt(10);
        var hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await user.create({firstName, lastName, address, phoneNumber, role, establishment, email, password:hashedPassword });
        res.status(201).send({
            success: true,
            message: 'Successfully Registred',
            firstName,
            lastName,
            address,
            role,
            establishment,
            email
        })
    }catch(error){
        res.status(500).send({
            success : false,
            message: "error in registre controller",
            error: error.message
        })
    }

    }

const loginController = async(req, res) => {
    try{
    const {email, password}= req.body;
    if(!email || !password) {
        return res.status(400).send({
            success: false,
            message: "Please Provide email and(or) password"
        })
    }
    const  userExist = await user.findOne({email});

    if(!userExist){
        return res.status(404).send({
            success : false,
            message: "User not found",
        })
    }
    
    const isMatch = await bcrypt.compare(password, userExist.password);
    if(!isMatch) {
        return res.status(401).send({   
            success : false,
            message: "Password is not  correct",
        })
    }

    const token = JWT.sign({id: userExist._id }, process.env.JWT_SECRET,{
        expiresIn: '1d'
    } );
    userExist.password=undefined;
    res.status(200).send({
        success : true,
        message: "Login Successfully",
        user,
        token
    })


    }catch(error){
        res.status(500).send({
            success : false,
            message: "error in login controller",
            error: error.message
        })
    }
}

module.exports = {registreController, loginController}