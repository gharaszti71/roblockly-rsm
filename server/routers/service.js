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
 * Session adatainak lekérése
 */
router.get('/service/:sid', auth, async (req, res) => {
    try {
        const sid = req.params.sid
        const session = await Session.get(sid)
        if (!session) {
            process.logger.warn('GET /service/:sid not found', { session_sid: session.sid })
            res.status(404).send()
        } else {
            process.logger.debug('GET /service/:sid success', { session_sid: session.sid, session_rosPort: session.rosPort, session_urPort: session.urPort})
            
      Session.getStatus(session.sid).then(status => {
        res.send({
          sid: session.sid,
          rosPort: session.rosPort,
          urPort: session.urPort,
          status
        })
      })
    }
} catch (e) {
    process.logger.error('GET /service/:sid failed: ', e, {sid: req.params.sid})
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

/**
* Futó konténerek listázása
*/
router.get('/containers', auth, async (req, res) => {
try {
    const containers = await Session.list()
    const result = containers.map(o => {
        return {
            id: o.Id,
            name: o.Names[0].slice(1),
            state: o.State,
            status: o.Status,
            orphan: !Session.get(o.Names[0].slice(1))
        }
    })
    res.send(result)
    process.logger.debug('GET /containers success', { containers: containers.length })
} catch (e) {
    res.status(400).send(e)
    process.logger.error('GET /containers failed: ', e)
}
})

router.post('/watchdog/:sid', auth, async (req, res) => {
try { 
    const sid = req.params.sid
    const session = await Session.get(sid)
    if (!session) {
        process.logger.warn('POST /watchdog/:sid not found', { session_sid: session.sid })
        res.status(404).send()
    } else {
        process.logger.debug('POST /watchdog/:sid success', { session_sid: session.sid, session_rosPort: session.rosPort, session_urPort: session.urPort})
        session.watchdog()
        res.send()
    }
} catch (e) {
    res.status(400).send(e)
    process.logger.error('POST /watchdog/:sid failed: ', e, {sid: req.params.sid})
}
})

module.exports = router