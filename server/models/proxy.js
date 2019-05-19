'use strict';

const net = require('net')
const EventEmitter = require('events')

class Proxy extends EventEmitter {

    constructor(proxyPort, targetIP, targetPort) {
        super()
        
        this.proxyPort = proxyPort
        this.targetIP = targetIP
        this.targetPort = targetPort

        this.proxy = net.createServer(socket => {
            this.emit('connect')

            const client = net.connect(targetPort, targetIP)
            socket.pipe(client).pipe(socket)

            socket.on('close', had_error => {
                client.destroy()
                this.emit('close', had_error)
            })

            socket.on('error', (err) => {
                console.log('Proxy: Socket closed non-gracefully!');
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