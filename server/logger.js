"use strict";

var winston = require('winston')
require('winston-daily-rotate-file')

// Sertup logging
var transport = new (winston.transports.DailyRotateFile)({
    filename: 'log/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  })

transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
})

var logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    //defaultMeta: { service: 'rrsm' },
    transports: [
        transport
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

process.logger = logger