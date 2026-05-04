const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { subscribeToQueue } = require("../service/rabbit");

const pendingUserRequests = new Map(); // userId → res

const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        let isUserAlreadyExists = await userModel.findOne({ email });

        if(isUserAlreadyExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            name, 
            email,
            password: encryptedPassword
        });

        const token = jwt.sign(
            {
                id: user._id
            }, 
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )

        res.cookie("token", token);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name,
                email
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register user",
            error: error.message
        });
    }
}

const login = async (req, res) => {

    try {
        
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        let isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.cookie("token", token);

        res.status(200).json({
            message: "User logged-in successfully",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
        

    } catch (error) {
        res.status(500).json({
            message: "Failed to login",
            error: error.message
        });
    }

}

const logout = async (req, res) => {

    try {
        
        const token = req.cookies.token || req.headers.authorization.split(" ")[1];

        if(token) {
            await blacklistTokenModel.create({ token });
        }

        res.clearCookie("token");

        res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to logout",
            error: error.message
        });
    }

}

const profile = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });        
    }
}

const acceptedRide = async (req, res) => {
    const userId = req.user._id.toString();

    let responded = false;

    const handler = (data) => {
        if (!responded) {
            responded = true;
            res.json(data);
        }
    };

    pendingUserRequests.set(userId, handler);

    setTimeout(() => {
        if (!responded) {
            responded = true;
            pendingUserRequests.delete(userId);
            res.status(204).end();
        }
    }, 30000);
};

subscribeToQueue('ride-accepted', async (msg) => {
    const data = JSON.parse(msg);

    const userId = data.user;

    const handler = pendingUserRequests.get(userId);

    if (handler) {
        handler(data); // ✅ safe call
        pendingUserRequests.delete(userId);
    }
});

/* const acceptedRide = async (req, res) => {

    const userId = req.user._id.toString();

    pendingUserRequests.set(userId, res);

    // Set timeout for long polling (e.g., 30 seconds)
    setTimeout(() => {
        pendingUserRequests.delete(userId);
        res.status(204).send();
    }, 30000);
} */

/* subscribeToQueue('ride-accepted', async (msg) => {    

    const data = JSON.parse(msg);    

    const userRes = pendingUserRequests.get(data.user);
    
    if (userRes) {
        userRes.json(data);
        pendingUserRequests.delete(data.userId);
    }
}); */

module.exports = { register, login, logout, profile, acceptedRide };