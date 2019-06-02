const User = require('../server/models/user')
const UserType = require('../server/models/userType')
const fs = require('fs')
const path = require('path')
const usersFilePath = path.join(__dirname, '../config/users.json')

test('users.json létrehozása, ha nincs', async () => {
    if (fs.existsSync(usersFilePath)){
        fs.unlinkSync(usersFilePath)
    }
    await User.load()
    expect(fs.existsSync(usersFilePath)).toEqual(true)
})

test('A két alapértelmezett felhasználó tesztelése', async () => {
    const token1 = await User.login('admin','password',UserType.Admin)
    const token2 = await User.login('service','password',UserType.Service)

    expect(token1).toBeDefined()
    expect(token2).toBeDefined()
})

test('User.getAll tesztelése', async () => {
    if (fs.existsSync(usersFilePath)){
        fs.unlinkSync(usersFilePath)
    }
    await User.load()
    const users = await User.getAll()
    expect(users).toBeInstanceOf(Array)
    expect(users).toHaveLength(2)
})

test('User.get tesztelése', async () => {
    const users = await User.getAll()
    expect(users).toBeInstanceOf(Array)
    expect(users.length).toBeGreaterThanOrEqual(1)

    const user = await User.get(users[0].id)
    expect(user.name).toBe('admin')
})

test('User.add tesztelése', async () => {
    if (fs.existsSync(usersFilePath)){
        fs.unlinkSync(usersFilePath)
    }
    await User.load()
    const id = await User.add('test1',UserType.Admin, 'password')
    const user = await User.get(id)
    expect(user.name).toBe('test1')
})

test('User.remove tesztelése', async () => {
    if (fs.existsSync(usersFilePath)){
        fs.unlinkSync(usersFilePath)
    }
    await User.load()
    const id = await User.add('test1',UserType.Admin, 'password')
    await User.remove(id)
    const users = await User.getAll()
    expect(users.some(o => o.id === id)).toBe(false)
})

// test('User.modify tesztelése', async () => {
//     const id = await User.add('test1',UserType.Admin, 'password')
//     const user = await User.get(id)
//     expect(user.name).toBe('test1')
//     const modified = await User.modify({id: id,name: 'Test2'})
//     expect(modified.name).toBe('Test2')
// })