"use strict";

const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.getSync(decoded.id)
        if (!user) {
            throw new Error()
        }
        req.user = user
        process.logger.debug('user authorized to auth middleware', {userName: user.name})
        next()
    } catch (e) {
        process.logger.error('Please authenticate!', {error: e.toString()})
        res.status(401).send({ error: 'Please authenticate!' })
    }
}

module.exports = auth