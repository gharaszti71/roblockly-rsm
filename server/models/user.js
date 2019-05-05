const fs = require('fs')
const path = require('path')
const uuid  = require('uuid/v4')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const UserType = require('./userType')
const configFilePath = path.join(__dirname, './../../config/users.json')
let users = []

class User {

    constructor(name, type, password) {
        this.id = uuid()
        this.name = name.trim()
        if (type !== UserType.Admin && type !== UserType.Service) {
            throw new Error('Invalid user type!')
        }
        this.type = type
        this.password = bcrypt.hashSync(password, 12)
        this.sessions = []
    }

    // id : uuid
    // name : String
    // type : UserType
    // password : salt + password hash, String
    /**
     * 
     * @param {String} name Felhasználói név
     * @param {String} password Felhasználói jelszó (plaintext)
     * @param {UserType} type Felhasználó tipus (Admin/Service)
     * @returns {String} JSON Web token
     */
    static async login(name, password, type) {
        const user = users.find(u => u.name === name && u.type === type)
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new Error('Invalid credentials!')
        }
        // token kiosztása
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
        return token
    }

    /**
     * Felhasználók betöltése a config/users.json fájlból a memóriába
     */
    static async load() {
        return new Promise((resolve, reject) => {
            fs.readFile(configFilePath, async (err, data) => {
                if (err) {
                    users = []
                    await User.add('admin',UserType.Admin, 'password')
                    return resolve()
                }
                users = JSON.parse(data.toString())
                resolve()
            })
        })
    }

    /**
     * Felhasználók elmentése. Hiba esetén továbbadjuk azt!
     */
    static async save() {
        return new Promise((resolve, reject) => {
            const usersToSave = JSON.stringify(users)
            fs.writeFile(configFilePath, usersToSave, (error) => {
                if (error) {
                    return reject('Something went wrong during the config/users.json writeing!')
                }
                resolve()
            })
        })
    }

    /**
     * Felhasználó hozzáadása
     * @param {String} name Felhasználói név
     * @param {UserType} type Felhasználó típusa: Admin/Service
     * @param {String} password Felhasználó jelszava
     */
    static async add(name, type, password) {
        if (users.some(u => u.name === name)) {
            return
        }
        const user = new User(name, type, password)
        users.push(user)
        await User.save()
    }

    /**
     * Felhasználó törlése
     * @param {uuid} id Felhasználó azonosítója
     */
    static async remove(id) {
        const usersKeep = users.filter(u => u.id !== id)
        if (usersKeep.length !== users.length) {
            users = usersKeep
            await User.save()
        }
    }

    /**
     * Betölti a felhasználót az id alapján
     * @param {uuid} id Felhasználói egyedi azonosító
     */
    static async get(id) {
        const user = users.find(u => u.id === id)
        if (!user) {
            throw new Error('User not found!')
        }
        return user;
    }

    /**
     * Visszaadja valamennyi felhasználót
     */
    static async getAll() {
        return new Promise((resolve, reject) => {
            resolve(users)
        })
    }
}

// Load users from disc
User.load().then(() => {
    console.log('Users loaded at', new Date().toTimeString())
})

module.exports = User