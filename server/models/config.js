"use strict";

const fs = require('fs')
const path = require('path')
const configFilePath = path.join(__dirname, './../../config/config.json')

class Config {

    constructor() {
        try {
            this.load()
        } catch (e) {
            this.createNew()
        }
    }

    /**
     * Konfiguráció betöltése
     */
    load() {
        const configBuff = fs.readFileSync(configFilePath)
        Object.assign(this, JSON.parse(configBuff))
    }

    /**
     * Konfiguráció elmentése
     */
    save() {
        const config = JSON.stringify(this)
        try {
            fs.writeFileSync(configFilePath, config)
        } catch (e) {
            console.log('Fatal Error, can not write config file: ', configFilePath, e);
        }
    }

    /**
     * Új konfiguráció készítése
     */
    createNew() {
        this.dockerHosts = [
            {
                host: 'http://192.168.1.141',
                ip: '192.168.1.141',
                port: 2375
            }
        ]
        this.network = 'RoblocklyNet'
        this.pools = {
            UR: {
                start: 40000,
                limit: 100
            },
            ROS: {
                start: 50000,
                limit: 100
            }
        }
        this.imageName = 'capsule'
        this.logLevel = 'debug'
        this.watchdogSeconds = 5
        this.maxInactivitySeconds = 120

        this.save()
        this.load()
    }
}

module.exports = new Config()