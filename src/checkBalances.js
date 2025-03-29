const { Client, AccountBalanceQuery } = require('@hashgraph/sdk');

async function checkBalances() {
    try {
        // Connect to the local node
        const client = Client.forNetwork({
            '127.0.0.1:6001': '0.0.3', // Local node address
        });
        client.setOperator('0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137'); // Replace <PRIVATE_KEY> with the private key for 0.0.2

        // Query the balance for 0.0.2
        const balance2 = await new AccountBalanceQuery()
            .setAccountId('0.0.2')
            .execute(client);
        console.log(`Balance of 0.0.2: ${balance2.hbars.toString()} HBAR`);

        // Query the balance for 0.0.3
        const balance3 = await new AccountBalanceQuery()
            .setAccountId('0.0.3')
            .execute(client);
        console.log(`Balance of 0.0.3: ${balance3.hbars.toString()} HBAR`);
    } catch (error) {
        console.error('Error checking balances:', error);
    }
    process.exit();

}

checkBalances();
