const net = require('net');

function findFreePort(startPort = 5000, endPort = 6000) {
    const freePorts = [];
    let currentPort = startPort;

    return new Promise((resolve) => {
        function checkNextPort() {
            if (currentPort > endPort) {
                return resolve(freePorts);
            }

            const server = net.createServer();
            server.listen(currentPort, () => {
                freePorts.push(currentPort);
                server.close(() => {
                    currentPort++;
                    checkNextPort();
                });
            });

            server.on('error', () => {
                currentPort++;
                checkNextPort();
            });
        }

        checkNextPort();
    });
}

findFreePort(5000, 5100).then((freePorts) => {
    console.log('Available Ports:', freePorts);
});
