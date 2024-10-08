const userModel = require("../models/userModel");
const courrierModel = require("../models/courrierModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const addCourrier = async (req, res) => {
    try {
        const { sender, receiver, subject, content } = req.body;
        const courrier = new courrierModel({ sender, receiver, subject, content });
        await courrier.save(); // Call save() as a function
        res.status(201).json(courrier); // Respond with the created courrier and a status code of 201
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
};

const updatePasswordController = async (req, res) => {

    const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const { oldPassword, newPassword } = req.body;
    
    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                success: false,
                message: 'Enter both old and new passwords'
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                success: false,
                message: 'Provide valid Token'
            });
        }

        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decode.id;

        const userExist = await userModel.findById(userId);
        if (!userExist) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        if(!passwordStrengthRegex.test(newPassword)){
            return res.status(400).send({
                success: false,
                message : "New password does not meet the strength requirements. It must be at least 8 characters long and include uppercase, lowercase letters, numbers, and special characters"
            })
        }
        const isMatch = await bcrypt.compare(oldPassword, userExist.password);
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: 'Old password does not match'
            });
        }

        const isTheSame = await bcrypt.compare(newPassword, userExist.password);
        
        if (isTheSame) {
            return res.status(400).send({
                success: false,
                message: 'New password cannot be the same as the old password'
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashNewPassword = await bcrypt.hash(newPassword, salt);
        
        userExist.password = hashNewPassword;
        await userExist.save();

        res.status(200).send({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error updating password api', 
            error :error.message
        });
    }
}

const updateProfileController = async(req, res)=> {
    try{

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneNumberRegex = /^(\+\d{1,3}[- ]?)?\d{6,15}$/;  

        const { newFirstName, newLastName, newAddress, newPhoneNumber, newRole, newEstablishment, newEmail}= req.body;
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decode.id;

        const userExist = await userModel.findById(userId);
        if (!userExist) {
            return res.status(404).send({
                success: false,
                message: 'User not found '
            });
        }
        if(newPhoneNumber){
            if(!phoneNumberRegex.test(newPhoneNumber)){
                return res.status(400).send({
                    success: false,
                    message : "Enter a valid phone number format"
            } )    
            }
        }
        if(newEmail){
            if(!emailRegex.test(newEmail)){   
                    return res.status(400).send({
                        success: false,
                        message : "Enter a valid email format"
                } )       
            }
        }
        const emailExist = await userModel.findOne({email: newEmail});
        if(emailExist && emailExist._id.toString() !== userId){
            return res.status(400).send({
                success: false,
                message: 'Email is already exist'
            })
        }

        if(newFirstName)  userExist.firstName = newFirstName 
        if(newLastName) userExist.lastName = newLastName 
        if(newAddress)  userExist.address = newAddress 
        if(newPhoneNumber)  userExist.phone = newPhoneNumber 
        if(newRole)  userExist.role = newRole
        if(newEstablishment)  userExist.establishment = newEstablishment 
        if(newEmail) userExist.email = newEmail


        await userExist.save();
        res.status(200).send({
            success : true,
            message: 'profile updated succesfully',
            userExist
        })

    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error updating profile api', 
            error :error.message
        });
    }
}

const consultProfileController = async(req, res)=> {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decode.id;

        const user = await userModel.findById(userId);
        const { firstName,
            lastName,
            address,
            phoneNumber,
            role,
            email,
            created_at} = user;

        return res.status(200).send({
            success : true,
            firstName,
            lastName,
            address,
            phoneNumber,
            role,
            email,
            created_at
        })


    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error consult profile api', 
            error :error.message
        });
    }
}

const treatCourrierController = async(req, res) => {
    try{
        const {courrierID, answer} = req.body ;
        if(!courrierID || !answer){
            return res.status(401).send({
                success: false,
                message: 'Enter all fileds please'
            });
        }

        const courrier = await courrierModel.findById( courrierID);

        if(!courrier){
            return res.status(404).send({
                success :false,
                message : 'No courrier Found'
            })
        }   

        
        const NowDate = new Date();

        courrier.traceability.push({
            action :answer,
            date: NowDate,
            user : courrier.receiver
        })
        
        courrier.status = "traité"  
        await courrier.save();

        res.status(200).send({
            success: true,
            message: 'Courrier treated successfully',
            courrier
        })  
    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error at treat courrirer  api', 
            error :error.message
        });
    }
}

const searchByNameController = async(req, res) => {
    try{

        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token ,process.env.JWT_SECRET);
        const user = await userModel.findById(decode.id);
        const userEmail = user.email;

        const {name} = req.params;
        const regex = RegExp(`${name}`, 'i');

        const Courriers = await courrierModel.find({sender : {$regex : regex}, receiver : userEmail, status:"Non-Traité"});
        if(Courriers.length === 0){
            return res.status(404).send({
                success: false,
                message : 'No courriers found'
            })
        }
        res.status(200).send({
            success: true,
            Courriers
        })
    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error search courrirer by name   api', 
            error :error.message
        });
    }
}
const searchByDateController = async(req, res) => {
    try{


        const token = req.headers.authorization?.split(' ')[1]; 

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user  = await userModel.findById(decode.id);
        const userEmail = user.email;


        const {date} = req.params;
        console.log(date)
        if(!date){
            return res.status(401).send({
                success : false,
                message : "Enter  date "
            })
        }
        const dateObj = new Date(date);

        if( isNaN(dateObj.getTime())){
            return res.status(401).send({
                success : false,
                message : "Enter a valid date "
            })
        }

        const startOfDay = new Date(dateObj.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setUTCHours(23,59 , 59 , 999));


        const Courriers = await courrierModel.find({ receivedDate :{
            $gte : startOfDay,
            $lte : endOfDay
        } ,  receiver : userEmail});

        if(Courriers.length === 0){
            return res.status(404).send({
                success: false,
                message : 'No courriers found'
            })
        }
        res.status(200).send({
            success: true,
            Courriers
        })
    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error search courrirer by name   api', 
            error :error.message
        });
    }
}


const consultCourrierController = async(req, res) => {
    try{

        const token = req.headers.authorization?.split(' ')[1]; 

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user  = await userModel.findById(decode.id);
        const userEmail = user.email;

        const Courriers = await courrierModel.find({status:'Non-Traité', receiver : userEmail}).sort({receivedDate: 1});
        
        if (!Courriers){
            return res.status(400).send({
                success : false,
                message :'No Courrier already exist'
            })
        };
        res.status(200).send({
            success: true,
            message: 'Liste des courriers',
            Courriers
        });

    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error consult Courrrier api', 
            error :error.message
        });
    }
}

const fecthCourrierDetails = async(req, res)=> {
    try{
        const courrierID = req.params.id;
        const courrier = await courrierModel.findById(courrierID);

        if (!courrier) {
            return res.status(404).send({
                success: false,
                message: 'Courrier not found',
            });
        }
        return res.status(200).send({
            success: true,
            courrier
        });

    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error  Courrrier  details api', 
            error :error.message
        });
    }
}

const fetchAllCourrier = async(req, res) => {
    try{

        const token = req.headers.authorization?.split(' ')[1]; 

        const courriers = await courrierModel.find({}).sort({ receivedDate: -1});

        if (!courriers) {
            return res.status(404).send({
                success: false,
                message: 'Courrier not found',
            });
        }

        return res.status(200).send({
            success: true,
            message : 'Courrier',
            courriers
        })
    }catch(error){
        res.status(500).send({
            success: false,
            message: 'Error  fecth Courrrier  api', 
            error :error.message
        });
    }
}

const fecthCourrierTrac = async (req, res )=> {
    try{
        const TracCourriers = await courrierModel.find({
            'traceability.0' : { $exists : true}
        })
        return res.status(200).send({
            success: true,
            TracCourriers
        })
    }catch(error){
        return res.status(500).send({
            success : false,
            message: "Error in Fetch Courrier Traceability api ",
            error: error.message
        })
    }
}


module.exports = { fecthCourrierTrac ,fetchAllCourrier , fecthCourrierDetails ,addCourrier, searchByDateController,treatCourrierController, searchByNameController,updatePasswordController , updateProfileController, consultProfileController,consultCourrierController };
