const {
    Client,
    AccountBalanceQuery,
    PrivateKey,
    TransferTransaction,
    Hbar
} = require('@hashgraph/sdk');

async function main() {
    try {
        // Connect to the local node
        const client = Client.forNetwork({
            '127.0.0.1:6001': '0.0.3', // Local node address and default account
        });
        client.setOperator('0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137'); // Replace <PRIVATE_KEY> with your private key

        console.log("Connected to the local Hedera network!");

        // Query the balance of the operator account
        const balance = await new AccountBalanceQuery()
            .setAccountId('0.0.2')
            .execute(client);
        console.log(`Operator account balance: ${balance.hbars.toString()} HBAR`);

        // Transfer HBAR from 0.0.2 to another account (e.g., 0.0.3)
        const transferTx = await new TransferTransaction()
            .addHbarTransfer('0.0.2', new Hbar(-10)) // Sending 10 HBAR
            .addHbarTransfer('0.0.3', new Hbar(10))  // Receiving 10 HBAR
            .execute(client);

        const receipt = await transferTx.getReceipt(client);
        console.log(`Transaction status: ${receipt.status}`);
    } catch (error) {
        console.error('Error interacting with local node:', error);
    }
    process.exit();

}

main();
