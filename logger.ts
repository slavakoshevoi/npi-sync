import log4js from 'log4js'
import config from './config'

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: 'info' } },
})

const logger = log4js.getLogger(config.env)
if (config.env == 'development') {
  logger.level = 'debug'
}

export default logger
