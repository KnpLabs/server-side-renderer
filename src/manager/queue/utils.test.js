import * as utils from './utils'

describe('manager :: queue :: utils', () => {
  it(`resolves job's duration`, () => {
    jest.spyOn(global.Date, 'now').mockImplementationOnce(() =>
      new Date('2021-06-03T14:00:01.000Z').valueOf(),
    )

    const jobMock = {
      data: {
        queuedAt: new Date('2021-06-03T14:00:00.000Z').valueOf(),
      },
    }

    expect(utils.resolveJobDuration(jobMock)).toBe(1)
  })
})
