import Bull from 'bull'
import createQueue from './queue'

jest.mock('bull')

beforeEach(() => {
  Bull.mockClear()
})

describe('queue :: createQueue', () => {
  it(`creates a queue with default options`, () => {
    const queueMock = { add: () => {}, process: () => {} }
    Bull.mockResolvedValue(queueMock)

    expect(createQueue('redis://redis:6379')).resolves.toBe(queueMock) // eslint-disable-line jest/valid-expect
    expect(Bull).toHaveBeenCalledTimes(1)
    expect(Bull).toHaveBeenCalledWith('request-queue', 'redis://redis:6379', {})
  })

  it(`creates a queue with specified options`, () => {
    const queueMock = { add: () => {}, process: () => {} }
    Bull.mockResolvedValue(queueMock)

    expect(createQueue('redis://redis:6379', { myOption: 'myOptionValue' })).resolves.toBe(queueMock) // eslint-disable-line jest/valid-expect
    expect(Bull).toHaveBeenCalledTimes(1)
    expect(Bull).toHaveBeenCalledWith('request-queue', 'redis://redis:6379', { myOption: 'myOptionValue' })
  })
})
