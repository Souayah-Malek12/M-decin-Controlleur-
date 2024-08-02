const JWT = require("jsonwebtoken");
const user = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send({
                success: false,
                message: 'Provide Token'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).send({
                success: false,
                message: 'Token is missing'
            });
        }

        const decodeToken = JWT.verify(token, process.env.JWT_SECRET);
        const userExist = await user.findById(decodeToken.id);

        if (!userExist) {
            return res.status(401).send({
                success: false,
                message: 'User not found'
            });
        }

        req.user = userExist;
        next();

    } catch (error) {
        res.status(401).send({
            success: false,
            message: 'Token is invalid or expired'
        });
    }
}

module.exports = authMiddleware;
