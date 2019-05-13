'use strict';

var net = require('net')

class Proxy {

    constructor(proxyPort, targetIP, targetPort) {
        
        this.proxyPort = proxyPort
        this.targetIP = targetIP
        this.targetPort = targetPort

        this.proxy = net.createServer(socket => {
            const client = net.connect(targetPort, targetIP)
            socket.pipe(client).pipe(socket);

            socket.on('close', had_error => {
                client.destroy()
            })
        })
        this.proxy.listen(proxyPort)
    }

    stop() {
        this.proxy.close(error => {
            this.proxy.unref()
        })
    }
}

module.exports = Proxy