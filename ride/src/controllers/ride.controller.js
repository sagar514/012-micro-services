const rideModel = require("../models/ride.model");
const { publishToQueue } = require("../service/rabbit");

const createRide = async (req, res) => {

    const { pickup, destination } = req.body;

    const newRide = await rideModel.create({
        user: req.user._id,
        pickup,
        destination
    });

    publishToQueue("new-ride", JSON.stringify(newRide));

    res.send(newRide);

}

const acceptRide = async (req, res) => {

    const rideId = req.query.rideId;

    // const ride = await rideModel.findOne({ _id: rideId, status: "requested" });
    const ride = await rideModel.findOne({ _id: rideId });

    if(!ride) {
        return res.status(404).json({
            message: "Ride not found"
        });
    }

    ride.captain = req.captain._id;
    ride.status = "accepted";
    await ride.save();

    publishToQueue("ride-accepted", JSON.stringify(ride));

    res.send(ride);

}

module.exports = { createRide, acceptRide }