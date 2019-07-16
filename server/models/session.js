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

    constructor(userId, sid, urPort, rosPoprt) {
        this.userId = userId
        this.sid = sid || uuid()
        this.urPort = urPort || urPool.get()
        this.rosPort = rosPoprt || rosPool.get()
        this.ip = config.dockerHosts[0].ip
        this.proxy = new Proxy(this.rosPort, this.ip, this.rosPort)

        this.proxy.on('close', () => {
            Session.delete(this.sid)
            process.logger.debug('ROS client closed connection, session destroyed!', { sid: this.sid, userId: this.userId });
        })

        this.proxy.on('connect', () => {
            process.logger.debug('New ROS client connected')
        })
    }

    /**
     * Init sessions variable after crash
     */
    static async init() {
        try {
            const containers = await this.list()
            if (containers.length > 0) {
                containers.forEach(item => {
                    const session = new Session(item.Labels.userId, item.Names[0].slice(1), item.Ports[0].PublicPort, item.Ports[1].PublicPort)
                    sessions.set(session.sid, session)
                    process.logger.debug('Session has benn restored', session)
                });
                process.logger.info(`Session.init() => ${sessions.size} session(s) has been restored`)
            }
        } catch (e) {
            process.logger.error('Session.init failed: ', e)
        }
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
            Labels: { userId },
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
     * Visszaadja az adott session adatait
     * @param {uuid} sid Session azonosító
     */
    static async get(sid) {
        const session = sessions.get(sid)
        return Promise.resolve(session)
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
                process.logger.error('Session.sendToCapsule failed: ', e)
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
        return containers
    }
}

module.exports = Session