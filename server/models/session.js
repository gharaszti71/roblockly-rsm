const uuid  = require('uuid/v4')

const sessions = new Map();

class Session {

    constructor(userId) {
        this.userId = userId
        this.sid = uuid()
        this.urPort = 33002 // valami pool-ból itt kell generáltatni ezeket...
        this.rosPort = 9999
    }

    /**
     * Új session indítása
     * @param {uuid} userId Felhasználói azonosító
     * @returns {Session} session objektum
     */
    static async create(userId) {
        return new Promise((resolve, reject) => {

            const session = new Session(userId)
            // mindenféle konténer indítás, port mappelés...
            // Ha lehet async/await, akkor nem kell a Promise csomagolás
            // session.urPort; session.rosPort
            
            sessions.set(session.sid, session)
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
            resolve()
        })
    }

    /**
     * Törli a session-t
     * @param {uuid} sid session azonosító
     */
    static async delete(sid) {
        return new Promise((resolve, reject) => {

            // mindenféle konténer leállítása, port recycle...
            // session.urPort; session.rosPort
            // Ha lehet async/await, akkor nem kell a Promise csomagolás

            if (!sessions.delete(sid)) {
                return reject('Session does not exist!')
            }
            resolve()
        })
    }
}

module.exports = Session