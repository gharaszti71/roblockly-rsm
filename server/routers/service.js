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
        process.logger.debug('POST /service/login success', {userName: req.body.name, userType: UserType.Service})
    } catch (e) {
        res.status(400).send()
        process.logger.error('POST /service/login failed: ', e)
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
        process.logger.debug('POST /service/start success', { session_sid: session.sid, session_rosPort: session.rosPort, session_urPort: session.urPort})
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('POST /service/start failed: ', e)
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
        process.logger.debug('POST /service/:sid success', { sid: req.params.sid })
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('POST /service/:sid failed: ', e, {sid: req.params.sid})
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
        process.logger.debug('DELETE /service/:sid success', { sid: req.params.sid })
    } catch (e) {
        res.status(400).send(e)
        process.logger.error('DELETE /service/:sid failed: ', e, {sid: req.params.sid})
    }
})

module.exports = router