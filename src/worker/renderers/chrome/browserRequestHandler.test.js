import browserRequestHandler from './browserRequestHandler'

const loggerMock = {
  debug: () => {},
}

const requestMock = {
  abort: jest.fn(),
  continue: jest.fn(),
  resourceType: () => 'xhr',
  url: () => 'https://www.example.com/dynamic.json',
}

beforeEach(() => {
  requestMock.abort.mockClear()
  requestMock.continue.mockClear()
})

describe('worker :: renderer :: browserRequestHandler', () => {
  it(`allows a request`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['*'],
          authorized_request_resources: ['*'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(0)
    expect(requestMock.continue).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledWith()
  })

  it(`redirects a request`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['*'],
          authorized_request_resources: ['*'],
          redirections: [{
            from: 'https://www.example.com',
            to: 'http://nginx',
          }],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(0)
    expect(requestMock.continue).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledWith({
      url: 'http://nginx/dynamic.json',
    })
  })

  it(`blocks a request because of unauthorized domain`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['another-service.example.com'],
          authorized_request_resources: ['*'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledTimes(0)
  })

  it(`allows a request with an authorized domain (partial)`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['example.com'],
          authorized_request_resources: ['*'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(0)
    expect(requestMock.continue).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledWith()
  })

  it(`allows a request with an authorized domain (full)`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['another-service.example.com', 'www.example.com'],
          authorized_request_resources: ['*'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(0)
    expect(requestMock.continue).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledWith()
  })

  it(`blocks a request because of unauthorized resource type`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['*'],
          authorized_request_resources: ['document'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledTimes(0)
  })

  it(`allows a request with an authorized resource type`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['*'],
          authorized_request_resources: ['document', 'xhr'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(0)
    expect(requestMock.continue).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledWith()
  })

  it(`blocks a request with an authorized domain but with an unauthorized resource type`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['example.com'],
          authorized_request_resources: ['document'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledTimes(0)
  })

  it(`blocks a request with an authorized resource type but with an unauthorized domain`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['another-service.example.com'],
          authorized_request_resources: ['xhr'],
          redirections: [],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledTimes(0)
  })
})
