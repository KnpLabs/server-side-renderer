import createScriptProvider from './scriptProvider'
import fs from 'fs'

jest.mock('fs')

beforeEach(() => {
  fs.readFileSync.mockClear()
})

describe('worker :: scriptProvider', () => {
  it(`throws an exception when requesting a non supported script`, () => {
    const scriptProvider = createScriptProvider()

    expect(() => scriptProvider.get('nonSupportedScript')).toThrowErrorMatchingSnapshot()
  })

  it(`throws an exception when the script content is invalid`, () => {
    const scriptProvider = createScriptProvider()

    fs.readFileSync.mockReturnValueOnce('notTheRightVariable = () => {};')

    expect(() => scriptProvider.get('postRender')).toThrowErrorMatchingSnapshot()
  })

  it(`returns the postRender script`, () => {
    const scriptProvider = createScriptProvider()

    fs.readFileSync.mockReturnValueOnce('script = () => {};')

    expect(scriptProvider.get('postRender')).toEqual(expect.any(Function))
  })
})
