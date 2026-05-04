const mongoose = require("mongoose");

const connectToDB = async () => {

    try {
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Ride service connected to DB");

    } catch (error) {
        console.log("Ride service failed to connect to DB");
        process.exit(1);
    }

}


module.exports = connectToDB;