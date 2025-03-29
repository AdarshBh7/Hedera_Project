require('dotenv').config();
const { Client } = require('@hashgraph/sdk');

function initializeClient() {
    const operatorId = process.env.ACCOUNT_ID;
    const operatorKey = process.env.PRIVATE_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error('Environment variables ACCOUNT_ID and PRIVATE_KEY must be set.');
    }

    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);
    console.log('Hedera client initialized.');
    return client;
}

module.exports = initializeClient;
