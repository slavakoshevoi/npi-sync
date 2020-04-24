import { exec, spawn } from 'child_process'
import { existsSync } from 'fs'
import { promisify } from 'util'
import config from '../config'
import logger from '../logger'
import { STATE_KEYS } from '../utils/state'

const execPromisified = promisify(exec)
const downloadedFilesDir = './data'

export default async () => {
  const monthlyDataPath = `${downloadedFilesDir}/${STATE_KEYS.LAST_MONTHLY}/data.csv`
  const weeklyDataPath = `${downloadedFilesDir}/${STATE_KEYS.LAST_WEEKLY}/data.csv`
  const deactivatedDataPath = `${downloadedFilesDir}/${STATE_KEYS.LAST_DEACTIVATED}/data.json`

  const monthlyFieldsNamePath = `${downloadedFilesDir}/${STATE_KEYS.LAST_MONTHLY}/data_fields.txt`
  const weeklyFieldsNamePath = `${downloadedFilesDir}/${STATE_KEYS.LAST_WEEKLY}/data_fields.txt`

  try { await execPromisified('mongoimport --help') } catch (e) {
    return logger.error('mongoimport not found')
  }

  async function syncMonthly() {
    if (existsSync(monthlyDataPath)) {
      logger.info('Monthly data import started...')
      const args = [
        '--uri', config.mongoDbConnectionString,
        '--type', 'csv',
        '-c', 'monthly_providers',
        '--fieldFile', monthlyFieldsNamePath,
        '--drop',
        '--ignoreBlanks',
        monthlyDataPath,
      ]
      try { await spawnPomisified('mongoimport', args) } catch (e) {
        return logger.error('Monthly data import error', e)
      }
    } else { logger.error('Monthly import data not found') }
  }

  async function syncWeekly() {
    if (existsSync(weeklyDataPath)) {
      logger.info('Weekly data import started...')
      const args = [
        '--uri', config.mongoDbConnectionString,
        '--type', 'csv',
        '-c', 'weekly_providers',
        '--drop',
        '--ignoreBlanks',
        '--fieldFile', weeklyFieldsNamePath,
        weeklyDataPath,
      ]
      try { await spawnPomisified('mongoimport', args) } catch (e) {
        return logger.error('Weekly data import error', e)
      }
    } else { logger.error('Weekly import data not found') }
  }

  async function syncDeactivated() {
    if (existsSync(deactivatedDataPath)) {
      logger.info('Deactivated data import started...')
      const args = [
        '--uri', config.mongoDbConnectionString,
        '--type', 'json',
        '-c', 'deactivated_providers',
        '--jsonArray',
        '--drop',
        deactivatedDataPath,
      ]
      try { await spawnPomisified('mongoimport', args) } catch (e) {
        return logger.error('Deactivated data import error', e)
      }
    } else { logger.error('Deactivated import data not found') }
  }

  await Promise.all([
    syncMonthly(),
    syncWeekly(),
    syncDeactivated(),
  ])
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
