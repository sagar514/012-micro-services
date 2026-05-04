const jwt = require("jsonwebtoken");
const axios = require("axios");

const userAuth = async (req, res, next) => {

    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorised"
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const url = `${process.env.BASE_URL}/user/profile`;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const user = response.data.user;

    if(!user) {
        return res.status(401).json({
            message: "Unauthorised"
        });
    }

    req.user = user;

    next();

}

const captainAuth = async (req, res, next) => {

    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorised"
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const url = `${process.env.BASE_URL}/captain/profile`;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const captain = response.data.captain;

    if(!captain) {
        return res.status(401).json({
            message: "Unauthorised"
        });
    }

    req.captain = captain;

    next();

}


module.exports = { userAuth, captainAuth };