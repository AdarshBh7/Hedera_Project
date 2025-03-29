const fs = require('fs').promises;

async function readData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        console.log(`File content:\n${data}`);
        return data;
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
    }
}

readData('./src/data.txt');

