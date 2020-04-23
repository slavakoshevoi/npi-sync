import {
  createReadStream, createWriteStream, existsSync, mkdirSync, readdir, unlink, writeFileSync, unlinkSync,
} from 'fs'
import { join as pathJoin } from 'path'
import { log } from 'util'
import excelToJson from 'convert-excel-to-json'
import unzipper from 'unzipper'
import logger from '../logger'
import { STATE_KEYS } from '../utils/state'

const downloadedFilesDir = './data'

export default async () => {
  const createFilePath = name => `${downloadedFilesDir}/${name}.zip`
  const monthlyZipFilepath = createFilePath(STATE_KEYS.LAST_MONTHLY)
  const weeklyZipFilepath = createFilePath(STATE_KEYS.LAST_WEEKLY)
  const deactivatedZipFilepath = createFilePath(STATE_KEYS.LAST_DEACTIVATED)

  if (existsSync(monthlyZipFilepath)) {
    await unzipFile(monthlyZipFilepath, STATE_KEYS.LAST_MONTHLY)
  }

  if (existsSync(weeklyZipFilepath)) {
    await unzipFile(weeklyZipFilepath, STATE_KEYS.LAST_WEEKLY)
  }

  if (existsSync(deactivatedZipFilepath)) {
    await unzipFile(deactivatedZipFilepath, STATE_KEYS.LAST_DEACTIVATED)
    await convertXlsxToJson(STATE_KEYS.LAST_DEACTIVATED)
  }

  async function unzipFile(filepath: string, filename: string): Promise<void> {
    const tempDirPath = `${downloadedFilesDir}/${filename}`
    if (!existsSync(`${downloadedFilesDir}/${filename}`)) {
      mkdirSync(tempDirPath)
    }

    await flushDirPromisify(tempDirPath)

    // Unzip archive
    const zip = createReadStream(filepath).pipe(unzipper.Parse({ forceStream: true }))
    const xlsxPath = `${tempDirPath}/data.xlsx`
    for await (const entry of zip) {
      if (filename === STATE_KEYS.LAST_DEACTIVATED && /^NPPES/.test(entry.path)) {
        logger.info(`${filename} extracting xlsx file...`)
        entry.pipe(createWriteStream(xlsxPath)).on('finish', () => {
          logger.info(`${filename} xlsx file was extracted`)
        })
      } else if ((filename === STATE_KEYS.LAST_WEEKLY || filename === STATE_KEYS.LAST_MONTHLY)) {
        if (/npidata_pfile_.+\d_FileHeader\.csv/.test(entry.path)) {
          logger.info(`${filename} extracting csv file header...`)
          entry.pipe(createWriteStream(`${tempDirPath}/data_header.csv`)).on('finish', () => {
            logger.info(`${filename} csv file header was extracted`)
          })
        } else if (/npidata_pfile_.+\d\.csv/.test(entry.path)) {
          logger.info(`${filename} extracting csv file...`)
          entry.pipe(createWriteStream(`${tempDirPath}/data.csv`)).on('finish', () => {
            logger.info(`${filename} csv file was extracted`)
          })
        } else entry.autodrain()
      } else {
        entry.autodrain()
      }
    }
  }

  async function convertXlsxToJson(folder) {
    const input = `${downloadedFilesDir}/${folder}/data.xlsx`
    const output = `${downloadedFilesDir}/${folder}/data.json`

    if (!existsSync(input)) {
      return logger.warn(`${folder} xlsx file not found`)
    }

    logger.info(`${folder} Started converting data.xlsx to json...`)
    const result = excelToJson({
      sourceFile: input,
      header: {
        rows: 2,
      },
      sheets: ['Export Worksheet'],
      columnToKey: { A: 'npi', B: 'deactivation_date' },
    })
    writeFileSync(output, JSON.stringify(result))
    unlinkSync(input)
    logger.info(`${folder} data.xlsx converted to json`)
  }
}

function flushDirPromisify(dir) {
  return new Promise(resolve => {
    readdir(dir, (err, files) => {
      if (err) return logger.error(err)
      for (const file of files) {
        unlink(pathJoin(dir, file), errUnlink => {
          if (errUnlink) return logger.error(errUnlink)
        })
      }
      resolve()
    })
  })
}
