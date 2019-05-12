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
        console.log('Config loaded', new Date().toTimeString());
    }

    load() {
        const configBuff = fs.readFileSync(configFilePath)
        Object.assign(this, JSON.parse(configBuff))
    }

    save() {
        const config = JSON.stringify(this)
        try {
            fs.writeFileSync(configFilePath, config)
        } catch (e) {
            console.log('Fatal Error, can not write config file: ', configFilePath, e);
        }
    }

    createNew() {
        this.dockerHosts = [
            {
                host: 'http://192.168.1.141',
                port: 2375
            }
        ]
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

        this.save()
        this.load()
    }
}

module.exports = new Config()