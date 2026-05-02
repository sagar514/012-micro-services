const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
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

        const user = await userModel.findOne({ _id: decoded.id });

        req.user = {
            _id: user._id,
            email: user.email,
            name: user.name
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
    

}

module.exports = { useAuth };