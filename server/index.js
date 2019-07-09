"use strict";

require('./logger');
const config = require('./models/config')
const app = require('./app')
const port = process.env.PORT

app.listen(port, () => {
    process.logger.info('Server is up on port ' + port)
})

/**
 * WatchDog indítása. Feliratkozás: process.on('watchdog', () =>{})
 */
setInterval(() => {
    process.emit('watchdog')
}, config.watchdogSeconds * 1000)
