import Bull from 'bull'

export const DEFAULT_QUEUE_OPTIONS = {}

export const DEFAULT_JOB_OPTIONS = {
  attempts: 1,
  timeout: 5000,
  removeOnComplete: true,
  removeOnFail: true,
}

export default (redisDsn, options = {}) => new Bull('request-queue', redisDsn, { ...DEFAULT_QUEUE_OPTIONS, ...options })
