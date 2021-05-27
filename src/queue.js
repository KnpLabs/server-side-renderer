import Bull from 'bull'

/**
 * @type Queue = Bull.Queue
 */

export const DEFAULT_QUEUE_OPTIONS = {}

export const DEFAULT_JOB_OPTIONS = {
  attempts: 1,
  removeOnComplete: true,
  removeOnFail: true,
}

// createQueue :: (String, Object) -> Queue
export default (redisDsn, options = {}) => new Bull('request-queue', redisDsn, { ...DEFAULT_QUEUE_OPTIONS, ...options })
