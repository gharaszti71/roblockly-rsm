"use strict";

require('./logger');
const app = require('./app')
const port = process.env.PORT

app.listen(port, () => {
    process.logger.info('Server is up on port ' + port)
})