"use strict";

require('./logger')
const Session = require('./models/session')
const app = require('./app')
const port = process.env.PORT

// Esetleges futó session-ök visszaintegrálása a rendszerbe
Session.init()

app.listen(port, () => {
    process.logger.info('Server is up on port ' + port)
})
