const uuid  = require('uuid/v4')
const Docker = require('dockerode')
const Pool = require('./pool')

const sessions = new Map();
const urPool = new Pool(40000, 100)
const rosPool = new Pool(50000, 100)
const docker = new Docker({host: 'http://192.168.1.243', port: 2375})
const imageName = 'capsule'

class Session {

    constructor(userId) {
        this.userId = userId
        this.sid = uuid()
        this.urPort = urPool.get()
        this.rosPort = rosPool.get()
    }

    /**
     * Új session indítása
     * @param {uuid} userId Felhasználói azonosító
     * @returns {Session} session objektum
     */
    static async create(userId) {
        return new Promise((resolve, reject) => {
            const session = new Session(userId)
            sessions.set(session.sid, session)

            // this.urPort és this.rosPort mappelésével docker container indítása
            // proxy indítása az adott porttal ez a gép rosPort <-> container rosPort
            docker.run(imageName, [], process.stdout, {
                "name": session.sid,
                "HostConfig": {
                    "PortBindings": {
                        "30002/tcp": [{"HostPort": "30002"}],
                        "9090/tcp": [{"HostPort": "9090"}]
                    }
                }
            });

            resolve(session)
        })
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
            // this.urPort -ra elküldeni a programot
            resolve()
        })
    }

    /**
     * Törli a session-t
     * @param {uuid} sid session azonosító
     */
    static async delete(sid) {
        return new Promise((resolve, reject) => {
            const session = sessions.get(sid)
            if (!session) {
                return reject('Session does not exist!')
            }
            urPool.drop(session.urPort)
            rosPool.drop(session.rosPort)
            sessions.delete(sid)
            // konténer elengedése
            const container = docker.getContainer(sid);
            if (container) {
                container.stop().then(o => o.remove());
            }
            resolve()
        })
    }
}

module.exports = Session