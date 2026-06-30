const { client } = require('./dynamodb');
const logger = require('../utils/logger')

const connectDB = async () => {
  try {
    logger.info("DynamoDB Connected Successfully")
    return client;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = connectDB;