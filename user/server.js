const http = require("http");
const app = require("./src/app");
const connectToDB = require("./src/db/config");

connectToDB();

const server = http.createServer(app);

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`User service is running on PORT ${PORT}`);
});
