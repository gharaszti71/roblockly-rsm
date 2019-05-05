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
        this.type = type
        this.password = bcrypt.hashSync(password, 12)
    }

    // id : uuid
    // name : String
    // type : UserType
    // password : salt + password hash, String

    static async Login(name, password) {
        const user = users.find(u => u.name === name)
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
    static async Load() {
        return new Promise((resolve, reject) => {
            fs.readFile(configFilePath, async (err, data) => {
                if (err) {
                    users = []
                    await User.Add('admin',UserType.Admin, 'password')
                    resolve()
                }
                users = JSON.parse(data.toString())
                resolve()
            })
        })
    }

    /**
     * Felhasználók elmentése. Hiba esetén továbbadjuk azt!
     */
    static async Save() {
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
    static async Add(name, type, password) {
        const user = new User(name, type, password)
        users.push(user)
        await User.Save()
    }

    /**
     * Felhasználó törlése
     * @param {uuid} id Felhasználó azonosítója
     */
    static async Remove(id) {
        const usersKeep = users.filter(u => u.id !== id)
        if (usersKeep.length !== users.length) {
            await User.Save()
        }
    }
}

// Load users from disc
User.Load().then(() => {
    console.log('Users loaded at', new Date().toTimeString())
})

module.exports = User