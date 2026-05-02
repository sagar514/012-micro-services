const bcrypt = require("bcrypt");
const jwt = require("json-web-token");
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

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
            }
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
        
        const token = req.cookies.token;

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

module.exports = { register, login, logout, profile };