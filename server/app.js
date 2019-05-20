"use strict";

const path = require('path')
const express = require('express')
const userRouter = require('./routers/user')
const serviceRouter = require('./routers/service')
const publicDirectoryPath = path.join(__dirname, '../public')

const app = express()

app.use(express.static(publicDirectoryPath))
app.use(express.json())
app.use(userRouter)
app.use(serviceRouter)

module.exports = app