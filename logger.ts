import { getLogger } from 'log4js'
import config from './config'

const logger = getLogger(config.env)
if (config.env == 'development') {
  logger.level = 'debug'
}

export default logger
