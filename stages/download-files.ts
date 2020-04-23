import { exists, promises } from 'fs'
import { promisify } from 'util'
import axios from 'axios'
import logger from '../logger'
import donwload from '../utils/donwload'
import { getState, STATE_KEYS } from '../utils/state'

const downloadedFilesDir = './data'

export default async () => {
  const { LAST_DEACTIVATED, LAST_MONTHLY, LAST_WEEKLY } = getState()

  await syncFile(STATE_KEYS.LAST_DEACTIVATED, LAST_DEACTIVATED)
  await syncFile(STATE_KEYS.LAST_MONTHLY, LAST_MONTHLY)
  await syncFile(STATE_KEYS.LAST_WEEKLY, LAST_WEEKLY)

  async function syncFile(filename: string, download_url: string): Promise<void> {
    const fileDir = `${downloadedFilesDir}/${filename}.zip`
    const isFileExists = await promisify(exists)(fileDir)
    if (!download_url) {
      if (isFileExists) await promises.unlink(fileDir)
      return logger.warn('Unlink missing file', filename)
    }
    if (isFileExists) {
      const fileInfo = await axios.head(download_url)
      const existsFileInfo = await promises.stat(fileDir)
      if (existsFileInfo.size === parseInt(fileInfo.headers['content-length'])) {
        return logger.info('File already downloaded', download_url)
      }
    }
    await donwload(download_url, fileDir)
  }
}
