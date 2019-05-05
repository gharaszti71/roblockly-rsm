const express = require('express')
const auth = require('../middleware/auth')
const UserType = require('../models/userType')
const router = new express.Router()

/**
 * Service User login
 */
router.post('/service/login', async (req, res) => {
    try {
        const token = await User.login(req.body.name, req.body.password, UserType.Service)
        //TODO: Session indítása és eltárolása az user.sessions tömbben (ami nem mentődik el)
        res.send({ token })
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router