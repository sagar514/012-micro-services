const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { subscribeToQueue } = require("../service/rabbit");

const pendingRequests = [];

const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        let isCaptainAlreadyExists = await captainModel.findOne({ email });

        if(isCaptainAlreadyExists) {
            return res.status(409).json({
                message: "Captain already exists"
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const captain = await captainModel.create({
            name, 
            email,
            password: encryptedPassword
        });

        const token = jwt.sign(
            {
                id: captain._id
            }, 
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )

        res.cookie("token", token);

        res.status(201).json({
            message: "Captain registered successfully",
            captain: {
                _id: captain._id,
                name,
                email,
                isAvailable: captain.isAvailable
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register captain",
            error: error.message
        });
    }
}

const login = async (req, res) => {

    try {
        
        const { email, password } = req.body;

        const captain = await captainModel.findOne({ email });
        if(!captain) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        let isPasswordValid = await bcrypt.compare(password, captain.password);
        if(!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: captain._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.cookie("token", token);

        res.status(200).json({
            message: "Captain logged-in successfully",
            captain: {
                _id: captain._id,
                email: captain.email,
                name: captain.name,
                isAvailable: captain.isAvailable
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
            message: "Captain logged out successfully"
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
            captain: req.captain
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });        
    }
}

const toggleAvailability = async (req, res) => {

    try {
        const captain = await captainModel.findOne({ _id: req.captain._id });
        captain.isAvailable = !captain.isAvailable;
        await captain.save();

        res.status(200).json({
            message: "success"
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }

}

const waitForNewRide = async (req, res) => {
    // Set timeout for long polling (e.g., 30 seconds)
    req.setTimeout(30000, () => {
        res.status(204).end(); // No Content
    });

    // Add the response object to the pendingRequests array
    pendingRequests.push(res);
};

subscribeToQueue("new-ride", (data) => {

    const rideData = JSON.parse(data);

    // Send the new ride data to all pending requests
    pendingRequests.forEach(res => {
        res.json(rideData);
    });

    // Clear the pending requests
    pendingRequests.length = 0;

})

module.exports = { register, login, logout, profile, toggleAvailability, waitForNewRide };