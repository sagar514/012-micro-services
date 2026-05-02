const jwt = require("jsonwebtoken");
const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

const useAuth = async (req, res, next) => {

    const cookieToken = req.cookies.token;
    const authHeaderToken = req.headers?.authorization?.split(" ")[1] ?? null;

    const token = cookieToken || authHeaderToken;

    if(!token) {
        return res.status(401).json({
            message: "Unauthorised"
        });
    }

    const isBlacklistedToken = await blacklistTokenModel.findOne({ token });
    if(isBlacklistedToken) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const captain = await captainModel.findOne({ _id: decoded.id });

        req.captain = {
            _id: captain._id,
            email: captain.email,
            name: captain.name,
            isAvailable: captain.isAvailable
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
    

}

module.exports = { useAuth };