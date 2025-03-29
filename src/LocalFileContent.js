const fs = require('fs').promises;
const { Client, FileContentsQuery } = require('@hashgraph/sdk');

async function readFileId(filePath) {
    try {
        const fileId = await fs.readFile(filePath, 'utf8');
        console.log(`File ID: ${fileId}`);
        return fileId.trim();
    } catch (error) {
        console.error(`Error reading File ID: ${error.message}`);
        throw error;
    }
}

async function fetchFileContent(fileId) {
    try {
        const client = Client.forNetwork({ '127.0.0.1:6001': '0.0.3' }); // Local network
        client.setOperator('0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137'); // Replace <PRIVATE_KEY> with your private key

        const fileContents = await new FileContentsQuery()
            .setFileId(fileId)
            .execute(client);

        console.log(`File content fetched:\n${fileContents.toString()}`);
        return fileContents.toString();
    } catch (error) {
        console.error(`Error fetching file content: ${error.message}`);
        throw error;
    }
}

async function main() {
    const fileIdPath = 'fileID.txt'; // Path to the file containing the File ID

    try {
        const fileId = await readFileId(fileIdPath);
        await fetchFileContent(fileId);
    } catch (error) {
        console.error(`Error in LocalFileContent.js flow: ${error.message}`);
    }
    process.exit();
}

main();
