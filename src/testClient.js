const initializeClient = require('./hederaClient');

async function test() {
    try {
        const client = initializeClient();
        console.log('Client initialized successfully!');
    } catch (error) {
        console.error(`Error initializing client: ${error.message}`);
    }
}

test();
