const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBIT_URL;

let connection, channel;

const connect = async () => {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
}

const subscribeToQueue = async (queueName, callback) => {

    if(!channel) {
        await connect();
    }

    await channel.assertQueue(queueName);
    channel.consume(queueName, (message) => {
        if(message !== null) {
            callback(message.content.toString());
            channel.ack(message);
        }
    });
}

const publishToQueue = async (queueName, data) => {

    if(!channel) {
        await connect();
    }

    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(data));
}

module.exports = {
    connect,
    subscribeToQueue,
    publishToQueue
}