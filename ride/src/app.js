require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const rideRoutes = require("./routes/ride.route");
const rabbitMQ = require("./service/rabbit");

const app = express();

rabbitMQ.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", rideRoutes);

module.exports = app;
