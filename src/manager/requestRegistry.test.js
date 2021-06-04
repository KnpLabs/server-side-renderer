import createRequestRegistry from './requestRegistry'

describe('manager :: requestRegistry', () => {
  it(`returns false when the request's id is not present in the registry`, () => {
    const requestRegistry = createRequestRegistry()
    requestRegistry.add({}, {}, {})

    expect(requestRegistry.has('non-existent-id')).toBe(false)
  })

  it(`returns true when the request's id is present in the registry`, () => {
    const requestRegistry = createRequestRegistry()
    const requestId = requestRegistry.add({}, {}, {})

    expect(requestRegistry.has(requestId)).toBe(true)
  })

  it(`adds a request to the registry`, () => {
    const requestRegistry = createRequestRegistry()
    const requestId = requestRegistry.add({}, {}, {})

    expect(requestId).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)
  })

  it(`completes an existing request with default status`, () => {
    const resFnCalls = {
      status: [],
      send: [],
    }
    const resMock = {
      status: function (...args) {
        resFnCalls.status.push(args)

        return this
      },

      send: function (...args) {
        resFnCalls.send.push(args)

        return this
      },
    }

    const requestRegistry = createRequestRegistry()
    const requestId = requestRegistry.add({}, resMock, {})

    requestRegistry.complete(requestId, 'Result string')

    expect(requestRegistry.has(requestId)).toBe(false)
    expect(resFnCalls.status).toHaveLength(1)
    expect(resFnCalls.status[0]).toEqual([200])
    expect(resFnCalls.send).toHaveLength(1)
    expect(resFnCalls.send[0]).toEqual(['Result string'])
  })

  it(`completes an existing request with specific status`, () => {
    const resFnCalls = {
      status: [],
      send: [],
    }
    const resMock = {
      status: function (...args) {
        resFnCalls.status.push(args)

        return this
      },

      send: function (...args) {
        resFnCalls.send.push(args)

        return this
      },
    }

    const requestRegistry = createRequestRegistry()
    const requestId = requestRegistry.add({}, resMock, {})

    requestRegistry.complete(requestId, 'Result string', 404)

    expect(requestRegistry.has(requestId)).toBe(false)
    expect(resFnCalls.status).toHaveLength(1)
    expect(resFnCalls.status[0]).toEqual([404])
    expect(resFnCalls.send).toHaveLength(1)
    expect(resFnCalls.send[0]).toEqual(['Result string'])
  })

  it(`does nothing when trying to complete a non existing request`, () => {
    const resFnCalls = {
      status: [],
      send: [],
    }
    const resMock = {
      status: function (...args) {
        resFnCalls.status.push(args)

        return this
      },

      send: function (...args) {
        resFnCalls.send.push(args)

        return this
      },
    }

    const requestRegistry = createRequestRegistry()
    requestRegistry.add({}, resMock, {})

    requestRegistry.complete('non-existing-request', 'Result string')

    expect(resFnCalls.status).toHaveLength(0)
    expect(resFnCalls.send).toHaveLength(0)
  })

  it(`fails an existing request with default status`, () => {
    const resFnCalls = {
      status: [],
      end: [],
    }
    const resMock = {
      status: function (...args) {
        resFnCalls.status.push(args)

        return this
      },

      end: function (...args) {
        resFnCalls.end.push(args)

        return this
      },
    }

    const requestRegistry = createRequestRegistry()
    const requestId = requestRegistry.add({}, resMock, {})

    requestRegistry.fail(requestId)

    expect(requestRegistry.has(requestId)).toBe(false)
    expect(resFnCalls.status).toHaveLength(1)
    expect(resFnCalls.status[0]).toEqual([500])
    expect(resFnCalls.end).toHaveLength(1)
    expect(resFnCalls.end[0]).toEqual([])
  })

  it(`fails an existing request with specific status`, () => {
    const resFnCalls = {
      status: [],
      end: [],
    }
    const resMock = {
      status: function (...args) {
        resFnCalls.status.push(args)

        return this
      },

      end: function (...args) {
        resFnCalls.end.push(args)

        return this
      },
    }

    const requestRegistry = createRequestRegistry()
    const requestId = requestRegistry.add({}, resMock, {})

    requestRegistry.fail(requestId, 504)

    expect(requestRegistry.has(requestId)).toBe(false)
    expect(resFnCalls.status).toHaveLength(1)
    expect(resFnCalls.status[0]).toEqual([504])
    expect(resFnCalls.end).toHaveLength(1)
    expect(resFnCalls.end[0]).toEqual([])
  })

  it(`does nothing when trying to fail a non existing request`, () => {
    const resFnCalls = {
      status: [],
      end: [],
    }
    const resMock = {
      status: function (...args) {
        resFnCalls.status.push(args)

        return this
      },

      end: function (...args) {
        resFnCalls.end.push(args)

        return this
      },
    }

    const requestRegistry = createRequestRegistry()
    requestRegistry.add({}, resMock, {})

    requestRegistry.fail('non-existing-request')

    expect(resFnCalls.status).toHaveLength(0)
    expect(resFnCalls.end).toHaveLength(0)
  })
})
