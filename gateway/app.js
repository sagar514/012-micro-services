require("dotenv").config();
const express = require("express");
const expressProxy = require("express-http-proxy");

const app = express();

app.use("/user", expressProxy(process.env.USER_SERVICE_URL));
app.use("/captain", expressProxy(process.env.CAPTAIN_SERVICE_URL));
app.use("/ride", expressProxy(process.env.RIDE_SERVICE_URL));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Gateway server is running on PORT ${PORT}`);
})