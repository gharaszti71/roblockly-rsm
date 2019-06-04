const Pool = require('../server/models/pool')

test('get szám igénylése', () => {
    const pool = new Pool(100, 5)
    const allocated = pool.get()
    expect(allocated).toBe(100)
})

test('drop szám visszatétele a poolba', () => {
    const pool = new Pool(100, 5)
    const allocated = pool.get()
    pool.drop(allocated)
    expect(pool.inUse.size).toEqual(0)
})

test('get x 2, drop 1 a poolba', () => {
    const pool = new Pool(100, 5)
    const allocated1 = pool.get()
    const allocated2 = pool.get()
    expect(pool.inUse.size).toEqual(2)
    pool.drop(allocated1)
    expect(pool.inUse.size).toEqual(1)
    expect(pool.inUse.has(101)).toBe(true)
    const allocated3 = pool.get()
    expect(allocated3).toBe(100)
})