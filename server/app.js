"use strict";

const path = require('path')
const express = require('express')
const userRouter = require('./routers/user')
const serviceRouter = require('./routers/service')
const publicDirectoryPath = path.join(__dirname, '../public')

const app = express()

app.use(express.static(publicDirectoryPath))
app.use(express.json())

// CORS (Cross-Origin Resource Sharing) miatt kell a header
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    next()
})

// Routerek regisztrálása
app.use(userRouter)
app.use(serviceRouter)

module.exports = app