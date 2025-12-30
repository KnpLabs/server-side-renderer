import Bull from 'bull'

export const DEFAULT_QUEUE_OPTIONS = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}

export const DEFAULT_JOB_OPTIONS = {
  attempts: 1,
}

export default (redisDsn, options = {}) => new Bull('request-queue', redisDsn, { ...DEFAULT_QUEUE_OPTIONS, ...options })
