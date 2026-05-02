const jwt = require("json-web-token");
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

const useAuth = async (req, res, next) => {

    const token = req.cookies.token;

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

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
    

}

module.exports = { useAuth };