const fs = require('fs').promises;
const { Client, FileCreateTransaction, Hbar } = require('@hashgraph/sdk');

async function readData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        console.log(`File content:\n${data}`);
        return data;
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        throw error;
    }
}

async function uploadToHedera(fileContent) {
    try {
        const client = Client.forNetwork({ '127.0.0.1:6001': '0.0.3' });
        client.setOperator('0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137'); // Replace <PRIVATE_KEY> with your private key

        const transaction = new FileCreateTransaction()
            .setContents(fileContent)
            .setMaxTransactionFee(new Hbar(2));

        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);

        const fileId = receipt.fileId;
        console.log(`File uploaded to Hedera with File ID: ${fileId}`);
        return fileId;
    } catch (error) {
        console.error(`Error uploading to Hedera: ${error.message}`);
        throw error;
    }
}

async function saveFileId(fileId, outputPath) {
    try {
        await fs.writeFile(outputPath, fileId.toString(), 'utf8');
        console.log(`File ID saved to ${outputPath}`);
    } catch (error) {
        console.error(`Error saving File ID: ${error.message}`);
        throw error;
    }
}

async function main() {
    const inputFilePath = 'data.txt';
    const outputFilePath = 'fileID.txt';

    try {
        const fileContent = await readData(inputFilePath);
        const fileId = await uploadToHedera(fileContent);
        await saveFileId(fileId, outputFilePath);
    } catch (error) {
        console.error(`Error in LocalLedger.js flow: ${error.message}`);
    }
    process.exit();
}

main();
