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
    } catch (e) {
        res.status(400).send()
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
    } catch (e) {
        res.status(400).send(e)
    }
})

/**
 * Get full user list
 */
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.getAll()
        res.send(users)
    } catch (e) {
        res.status(400).send(e)
    }
})

/**
 * Delete a user
 */
router.delete('/users/:id', auth, async (req, res) => {
    try {
        await User.remove(req.params.id)
        res.send()
    } catch (e) {
        res.status(400).send(e)
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
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router