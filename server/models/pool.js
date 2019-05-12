"use strict";

/**
 * Szám pool
 */
class Pool {

    constructor(start, length) {
        this.start = start
        this.length = length
        this.pool = [...Array(length).keys()].map((_,i) => i + start)
        this.inUse = new Set()
    }

    /**
     * Új szám kérése a poolból
     */
    get() {
        const free = this.pool.filter(i => !this.inUse.has(i))
        if (free.length === 0) {
            throw new Error('Nincs szabad port!')
        }
        const port = free[0]
        this.inUse.add(port)
        return port
    }
    
    /**
     * Szám visszaadása a poolnak
     * @param {Number} num visszaadandó szám
     */
    drop(num) {
        this.inUse.delete(num)
    }
}

module.exports = Pool