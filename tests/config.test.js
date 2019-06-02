const fs = require('fs')
const path = require('path')

test('config.json létrehozása, ha nincs', () => {
    const configFilePath = path.join(__dirname, './../config/config.json')
    if (fs.existsSync(configFilePath)){
        fs.unlinkSync(configFilePath)
    }
    const config = require('../server/models/config')
    expect(fs.existsSync(configFilePath)).toEqual(true)
    expect(config.network).toEqual('RoblocklyNet')
})

test('Konfiguráció mentése', () => {
    const config = require('../server/models/config')
    config.network = 'other'
    config.save()
    config.load()
    expect(config.network).toEqual('other')
})

test('Konfiguráció tételes ellenőrzése', () => {
    const config = require('../server/models/config')
    expect(config.dockerHosts).toBeInstanceOf(Array)
    expect(config.dockerHosts.length).toBeGreaterThanOrEqual(1)
    config.dockerHosts.forEach(e => {
        expect(e).toBeInstanceOf(Object)
        expect(e.host).toBeDefined()
        expect(e.ip).toBeDefined()
        expect(e.port).toBeDefined()
    })
    expect(config.network).toBeDefined()
    expect(config.imageName).toBeDefined()
    expect(config.pools).toBeInstanceOf(Object)
    expect(config.pools).toHaveProperty(['UR','limit'], 100)
    expect(config.pools).toHaveProperty(['UR','start'], 40000)
    expect(config.pools).toHaveProperty(['ROS','limit'], 100)
    expect(config.pools).toHaveProperty(['ROS','start'], 50000)
})