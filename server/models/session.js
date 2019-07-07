"use strict";

const uuid  = require('uuid/v4')
const Docker = require('dockerode')
const Pool = require('./pool')
const config = require('./config')
const net = require('net');
const Proxy = require('./proxy')

const sessions = new Map();
const urPool = new Pool(config.pools.UR.start, config.pools.UR.limit)
const rosPool = new Pool(config.pools.ROS.start, config.pools.ROS.limit)
const docker = new Docker({
    host: config.dockerHosts[0].host, 
    port: config.dockerHosts[0].port
})

class Session {

    constructor(userId) {
        this.userId = userId
        this.sid = uuid()
        this.urPort = urPool.get()
        this.rosPort = rosPool.get()
        this.ip = config.dockerHosts[0].ip  // valamilyen stratégiával lehetne szétosztani a terhelést több gép között
        this.proxy = new Proxy(this.rosPort, this.ip, this.rosPort)
        this.proxy.on('close', () => {
            Session.delete(this.sid)
            console.log('ROS client closed connection, session destroyed!');
        })

        this.proxy.on('connect', () => {
            console.log('New ROS client connected')
        })
    }

    /**
     * Új session indítása
     * @param {uuid} userId Felhasználói azonosító
     * @returns {Session} session objektum
     */
    static async create(userId) {
        const session = new Session(userId)
        sessions.set(session.sid, session)

        const container = await docker.createContainer({
            Image: config.imageName,
            name: session.sid,
            HostConfig: {
                NetworkMode: config.network,
                PortBindings: {
                    "30002/tcp": [{"HostPort": session.urPort.toString()}],
                    "9090/tcp": [{"HostPort": session.rosPort.toString()}]
                }
            }
        })
        await container.start()
        return session
    }

    /**
     * Program küldése a session kapszulájának
     * @param {uuid} sid Session azonosító
     * @param {String} program Program kódja
     */
    static async sendProgram(sid, program) {
        const session = sessions.get(sid)
        if (!session) {
            throw new Error('Session does not exist!')
        }
        await session.sendToCapsule(program)
    }

    /**
     * Roblockly program küldése a kapszulának
     * @param {String} program A kapszulának szánt Roblockly program
     */
    async sendToCapsule(program) {
        return new Promise((resolve, reject) => {
            try {
                const client = net.Socket()
                client.connect(this.urPool, this.ip)
                client.write(program)
                client.end()
            } catch (e) {
                console.log(e)
            }
            resolve()
        })
    }

    /**
     * Törli a session-t
     * @param {uuid} sid session azonosító
     */
    static async delete(sid) {
        const session = sessions.get(sid)
        if (session) {
            urPool.drop(session.urPort)
            rosPool.drop(session.rosPort)
            session.proxy.stop()
            sessions.delete(sid)
        }
        const container = docker.getContainer(sid);
        if (container) {
            //container.stop().then(o => o.remove());
            await container.remove({force: true})
        }
    }

    /**
     * Listázza a session-öket
     */
    static async list() {
        let op = {
            all: true,
            filters: {"ancestor": [config.imageName]}
        };
        const containers = await docker.listContainers(op)

        return containers.map(o => {
            return {
                id: o.Id,
                name: o.Names[0].slice(1),
                state: o.State,
                status: o.Status,
                orphan: !sessions.get(o.Names[0].slice(1))
            }
        })
    }
}

module.exports = Session