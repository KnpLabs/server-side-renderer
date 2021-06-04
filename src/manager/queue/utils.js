// resolveJobDuration :: Job -> Integer
export const resolveJobDuration = job => (Date.now() - job.data.queuedAt) / 1000
