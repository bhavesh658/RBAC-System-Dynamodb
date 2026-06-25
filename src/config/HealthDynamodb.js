const { client } = require('./dynamodb');

const connectDB = async () => {
  try {
    console.log('DynamoDB connected successfully');
    return client;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = connectDB;