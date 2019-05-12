"use strict";

const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const UserType = require('../models/userType')
const Session = require('../models/session')
const router = new express.Router()

/**
 * Service User login
 */
router.post('/service/login', async (req, res) => {
    try {
        const token = await User.login(req.body.name, req.body.password, UserType.Service)
        res.send({ token })
    } catch (e) {
        res.status(400).send()
    }
})

/**
 * Service session indítása
 */
router.post('/service/start', auth, async (req, res) => {
    try {
        const session = await Session.create(req.user.id)
        res.send({ 
            sid: session.sid,
            rosPort: session.rosPort,
            urPort: session.urPort
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

/**
 * Roblockly program küldése
 */
router.post('/service/:sid', auth, async (req, res) => {
    try {
        const sid = req.params.sid
        const program = req.body.program
        await Session.sendProgram(sid, program)
        res.send()
    } catch (e) {
        res.status(400).send(e)
    }
})

/**
 * Service session lezárása
 */
router.delete('/service/:sid', auth, async (req, res) => {
    try {
        const sid = req.params.sid
        await Session.delete(sid)
        res.send()
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router