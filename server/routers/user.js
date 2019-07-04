"use strict";

const express = require('express')
const User = require('../models/user')
const UserType = require('../models/userType')
const auth = require('../middleware/auth')
const router = new express.Router()

/**
 * Admin User login
 */
router.post('/users/login', async (req, res) => {
    try {
        const token = await User.login(req.body.name, req.body.password, UserType.Admin)
        res.send({ token })
        process.logger.debug('POST /users/login success', {userName: req.body.name, userType: UserType.Admin})
    } catch (e) {
        res.status(400).send()
        process.logger.error('POST /users/login failed: ', e)
    }
})

/**
 * Create User
 */
router.post('/users', auth, async (req, res) => {
    const userType = req.body.type === 'Admin' ? UserType.Admin : req.body.type === 'Service' ? UserType.Service : undefined
    try {
        await User.add(req.body.name, userType, req.body.password)
        res.status(201).send()
        process.logger.debug('POST /users created', {userName: req.body.name, userType: userType})
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('POST /users failed: ', e)
    }
})

/**
 * Get full user list
 */
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.getAll()
        res.send(users)
        process.logger.debug('GET /users users', {userList: users})
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('GET /users failed: ', e)
    }
})

/**
 * Delete a user
 */
router.delete('/users/:id', auth, async (req, res) => {
    try {
        await User.remove(req.params.id)
        res.send()
        process.logger.debug('DELETE /users/:id deleted', {userId: req.params.id})
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('DELETE /users/:id failed: ', e)
    }
})

/**
 * Modify a user
 */
router.patch('/users/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'type', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.get(req.params.id)
        if (!user) {
            throw new Error('User not found!')
        }
        updates.forEach(update => user[update] = req.body[update])
        const result = await User.modify(user)
        res.send(result)
        process.logger.debug('PATCH /users/:id deleted', {userId: req.params.id, body: req.body})
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('PATCH /users/:id failed: ', e)
    }
})

module.exports = router