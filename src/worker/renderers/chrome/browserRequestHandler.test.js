import browserRequestHandler from './browserRequestHandler'

const loggerMock = {
  debug: () => {},
}

const requestMock = {
  abort: jest.fn(),
  continue: jest.fn(),
  resourceType: () => 'xhr',
  url: () => 'http://api.i24news.tv/v2/en/contents',
}

beforeEach(() => {
  requestMock.abort.mockClear()
  requestMock.continue.mockClear()
})

describe('browserRequestHandler', () => {
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
            from: 'http://api.i24news.tv',
            to: 'http://api',
          }],
        },
      },
    }

    browserRequestHandler(configuration, loggerMock)(requestMock)

    expect(requestMock.abort).toHaveBeenCalledTimes(0)
    expect(requestMock.continue).toHaveBeenCalledTimes(1)
    expect(requestMock.continue).toHaveBeenCalledWith({
      url: 'http://api/v2/en/contents',
    })
  })

  it(`blocks a request because of unauthorized domain`, () => {
    const configuration = {
      worker: {
        renderer: {
          authorized_request_domains: ['www.i24news.tv'],
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
          authorized_request_domains: ['i24news.tv'],
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
          authorized_request_domains: ['backend.i24news.tv', 'api.i24news.tv', 'www.i24news.tv'],
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
          authorized_request_domains: ['i24news.tv'],
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
          authorized_request_domains: ['www.i24news.tv'],
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
