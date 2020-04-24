import {
  createReadStream, createWriteStream, existsSync, mkdirSync, readdir, unlink, writeFileSync, unlinkSync,
  readFileSync, renameSync,
} from 'fs'
import { join as pathJoin } from 'path'
import excelToJson from 'convert-excel-to-json'
import _ from 'lodash'
import unzipper from 'unzipper'
import config from '../config'
import logger from '../logger'
import RemoveFirstLine from '../utils/removeFirstLine'
import { STATE_KEYS } from '../utils/state'

const {
  downloadedFilesDir, dataFileNameXlsx, dataFileNameJson, dataFileNameCsv, headerFileNameCsv, fieldNameFile,
} = config

export default async () => {
  const createFilePath = name => `${downloadedFilesDir}/${name}.zip`
  const monthlyZipFilepath = createFilePath(STATE_KEYS.LAST_MONTHLY)
  const weeklyZipFilepath = createFilePath(STATE_KEYS.LAST_WEEKLY)
  const deactivatedZipFilepath = createFilePath(STATE_KEYS.LAST_DEACTIVATED)

  if (existsSync(monthlyZipFilepath)) {
    await unzipFile(monthlyZipFilepath, STATE_KEYS.LAST_MONTHLY)
    await createFieldsNameFile(STATE_KEYS.LAST_MONTHLY)
  }

  if (existsSync(weeklyZipFilepath)) {
    await unzipFile(weeklyZipFilepath, STATE_KEYS.LAST_WEEKLY)
    await createFieldsNameFile(STATE_KEYS.LAST_WEEKLY)
  }

  if (existsSync(deactivatedZipFilepath)) {
    await unzipFile(deactivatedZipFilepath, STATE_KEYS.LAST_DEACTIVATED)
    await convertXlsxToJson(STATE_KEYS.LAST_DEACTIVATED, 'Export Worksheet')
  }

  async function unzipFile(filepath: string, filename: string): Promise<void> {
    const dirPath = `${downloadedFilesDir}/${filename}`
    if (!existsSync(`${downloadedFilesDir}/${filename}`)) {
      mkdirSync(dirPath)
    }

    await flushDirPromisify(dirPath)

    // Unzip archive
    const zip = createReadStream(filepath).pipe(unzipper.Parse({ forceStream: true }))
    for await (const entry of zip) {
      if (filename === STATE_KEYS.LAST_DEACTIVATED && /^NPPES/.test(entry.path)) {
        logger.info(`${filename} extracting xlsx file...`)
        entry.pipe(createWriteStream(`${dirPath}/${dataFileNameXlsx}`)).on('finish', () => {
          logger.info(`${filename} xlsx file was extracted`)
        })
      } else if ((filename === STATE_KEYS.LAST_WEEKLY || filename === STATE_KEYS.LAST_MONTHLY)) {
        if (/npidata_pfile_.+\d_FileHeader\.csv/.test(entry.path)) {
          logger.info(`${filename} extracting csv file header...`)
          entry.pipe(createWriteStream(`${dirPath}/${headerFileNameCsv}`)).on('finish', () => {
            logger.info(`${filename} csv file header was extracted`)
          })
        } else if (/npidata_pfile_.+\d\.csv/.test(entry.path)) {
          logger.info(`${filename} extracting csv file...`)
          entry.pipe(createWriteStream(`${dirPath}/${dataFileNameCsv}`)).on('finish', () => {
            logger.info(`${filename} csv file was extracted`)
          })
        } else entry.autodrain()
      } else {
        entry.autodrain()
      }
    }
  }

  async function convertXlsxToJson(folder: string, sheet: string): Promise<any> {
    const path = `${downloadedFilesDir}/${folder}`
    const input = `${path}/${dataFileNameXlsx}`
    const output = `${path}/${dataFileNameJson}`

    if (!existsSync(input)) {
      return logger.warn(`${folder} xlsx file not found`)
    }

    logger.info(`${folder} Started converting data.xlsx to json...`)
    try {
      let result = excelToJson({
        sourceFile: input,
        header: {
          rows: 2,
        },
        sheets: [sheet],
        columnToKey: { A: 'npi', B: 'deactivation_date' },
      })
      writeFileSync(output, JSON.stringify(result[sheet]))
    } catch (e) {
      return logger.info(`${folder} convert to xlsx error`, e)
    }

    unlinkSync(input)
    logger.info(`${folder} data.xlsx converted to json`)
  }

  async function createFieldsNameFile(folder: string): Promise<any> {
    const dirPath = `${downloadedFilesDir}/${folder}`
    if (!existsSync(`${dirPath}/${headerFileNameCsv}`)) {
      logger.error(`${folder} header file not found`)
      return flushDirPromisify(dirPath)
    }

    if (!existsSync(`${dirPath}/${dataFileNameCsv}`)) {
      logger.error(`${folder} data file not found`)
      return flushDirPromisify(dirPath)
    }

    let header = await readFileSync(`${dirPath}/${headerFileNameCsv}`, 'utf8')
    let headerArray = header.split(',')
    let headerArrayUpdated = [] as any
    const formatHeader = h => `${h.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_').toLowerCase()}\n`
    _.each(headerArray, h => headerArrayUpdated.push(formatHeader(h)))
    writeFileSync(`${dirPath}/${fieldNameFile}`, headerArrayUpdated.join(''), 'utf8')

    let inputPath = `${dirPath}/${dataFileNameCsv}`
    let outputPath = `${dirPath}/_${dataFileNameCsv}`

    await removeHeaderLine(inputPath, outputPath)
    await unlinkSync(inputPath)
    await renameSync(outputPath, inputPath)
  }
}

function removeHeaderLine(input_path, output_path) {
  return new Promise((resolve, reject) => {
    let input = createReadStream(input_path)
    let output = createWriteStream(output_path)
    input.pipe(RemoveFirstLine()).pipe(output)
    output.on('finish', () => {
      resolve()
    })
  })
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
