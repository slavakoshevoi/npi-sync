import { exec, spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve as resolvePath } from 'path'
import { promisify } from 'util'
import _ from 'lodash'
import config from '../config'
import logger from '../logger'
import { STATE_KEYS } from '../utils/state'

const execPromisified = promisify(exec)
const downloadedFilesDir = './data'

export default async stages => {
  const { LAST_DEACTIVATED, LAST_MONTHLY, LAST_WEEKLY } = STATE_KEYS

  const monthlyDataPath = `${downloadedFilesDir}/${STATE_KEYS.LAST_MONTHLY}`
  const weeklyDataPath = `${downloadedFilesDir}/${STATE_KEYS.LAST_WEEKLY}`
  const deactivatedDataPath = `${downloadedFilesDir}/${STATE_KEYS.LAST_DEACTIVATED}`

  const mongoImportScript = resolvePath(__dirname, '../importMongoDB.sh')

  try { await execPromisified('mongoimport --help') } catch (e) {
    return logger.error('mongoimport not found')
  }

  try { await execPromisified(`mongo ${config.mongoDbConnectionString} --eval "db.${config.mongoDbCollection}.createIndex({npi: 1})"`) } catch (e) {
    return logger.error('index was not created')
  }

  const syncTasks: Promise<void>[] = []

  if (_.includes(stages, LAST_WEEKLY)) syncTasks.push(syncWeekly())
  if (_.includes(stages, LAST_MONTHLY)) syncTasks.push(syncMonthly())

  async function syncMonthly() {
    if (existsSync(monthlyDataPath)) {
      logger.info('Monthly data import started...')
      const args = [
        monthlyDataPath,
        config.mongoDbConnectionString,
        config.mongoDbCollection,
      ]
      try { await spawnPomisified(mongoImportScript, args) } catch (e) {
        return logger.error('Monthly data import error', e)
      }
    } else { logger.error('Monthly import data not found') }
  }

  async function syncWeekly() {
    if (existsSync(weeklyDataPath)) {
      logger.info('Weekly data import started...')
      const args = [
        weeklyDataPath,
        config.mongoDbConnectionString,
        config.mongoDbCollection,
      ]
      try { await spawnPomisified(mongoImportScript, args) } catch (e) {
        return logger.error('Weekly data import error', e)
      }
    } else { logger.error('Weekly import data not found') }
  }

  async function syncDeactivated() {
    if (existsSync(deactivatedDataPath)) {
      logger.info('Deactivated data import started...')
      const args = [
        deactivatedDataPath,
        config.mongoDbConnectionString,
        config.mongoDbCollection,
      ]
      try { await spawnPomisified(mongoImportScript, args) } catch (e) {
        return logger.error('Deactivated data import error', e)
      }
    } else { logger.error('Deactivated import data not found') }
  }

  await Promise.all(syncTasks)
  if (_.includes(stages, LAST_DEACTIVATED)) await syncDeactivated()
}

function spawnPomisified(command, args) {
  return new Promise(resolve => {
    const process = spawn(command, args)

    process.stdout.on('data', data => {
      logger.debug(data.toString().replace(/\n$/, ''))
    })

    process.stderr.on('data', data => {
      logger.debug(data.toString().replace(/\n$/, ''))
    })

    process.on('exit', code => {
      resolve(code?.toString())
    })
  })
}
