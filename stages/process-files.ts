import {
  createReadStream, createWriteStream, existsSync, mkdirSync, readdir, unlink, writeFileSync, unlinkSync,
} from 'fs'
import { join as pathJoin } from 'path'
import excelToJson from 'convert-excel-to-json'
import csv from 'csv-parser'
import _ from 'lodash'
import unzipper from 'unzipper'
import config from '../config'
import logger from '../logger'
import { N } from '../utils'
import convertRow, { convertDate } from '../utils/convertRowJson'
import { STATE_KEYS } from '../utils/state'

const {
  downloadedFilesDir, dataFileNameXlsx, dataFileNameJson, dataFileNameCsv, headerFileNameCsv,
} = config

export default async stages => {
  const { LAST_DEACTIVATED, LAST_MONTHLY, LAST_WEEKLY } = STATE_KEYS

  const createFilePath = name => `${downloadedFilesDir}/${name}.zip`
  const monthlyZipFilepath = createFilePath(LAST_MONTHLY)
  const weeklyZipFilepath = createFilePath(LAST_WEEKLY)
  const deactivatedZipFilepath = createFilePath(LAST_DEACTIVATED)

  if (_.includes(stages, LAST_DEACTIVATED)) {
    if (existsSync(deactivatedZipFilepath)) {
      await unzipFile(deactivatedZipFilepath, LAST_DEACTIVATED)
      await convertXlsxToJson(LAST_DEACTIVATED, 'Export Worksheet')
    }
  }

  if (_.includes(stages, LAST_MONTHLY)) {
    if (existsSync(monthlyZipFilepath)) {
      await unzipFile(monthlyZipFilepath, LAST_MONTHLY)
      await convertCsv(LAST_MONTHLY)
    }
  }

  if (_.includes(stages, LAST_WEEKLY)) {
    if (existsSync(weeklyZipFilepath)) {
      await unzipFile(weeklyZipFilepath, LAST_WEEKLY)
      await convertCsv(LAST_WEEKLY)
    }
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
        columnToKey: { A: 'npi', B: 'npi_deactivation_date' },
      })
      result = _.map(result[sheet], row => ({ npi: N(row.npi), npi_deactivation_date: convertDate(row.npi_deactivation_date) }))
      writeFileSync(output, JSON.stringify(result))
    } catch (e) {
      return logger.info(`${folder} convert to xlsx error`, e)
    }

    unlinkSync(input)
    logger.info(`${folder} data.xlsx converted to json`)
  }

  async function convertCsv(folder: string): Promise<any> {
    const dirPath = `${downloadedFilesDir}/${folder}`
    if (!existsSync(`${dirPath}/${dataFileNameCsv}`)) {
      logger.error(`${folder} data file not found`)
      return flushDirPromisify(dirPath)
    }

    await csvConvertPromisified(`${dirPath}/${dataFileNameCsv}`, dirPath)
    await unlinkSync(`${dirPath}/${dataFileNameCsv}`)
  }
}

function csvConvertPromisified(input_path, output_dir_path) {
  return new Promise(resolve => {
    const maxFileSize = 100000
    let count = 0
    let fileNumber = 1
    let lastFile = false
    let input = createReadStream(input_path, { encoding: 'utf8' })
    let output: any = null
    let results = [] as any
    input.pipe(csv({
      mapHeaders: ({ header: h }) => `${h.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_').toLowerCase()}`,
    })).on('data', async data => {
      const outputPath = `${output_dir_path}/${fileNumber}_${dataFileNameJson}`
      if (_.isEmpty(output) && !lastFile) {
        output = createWriteStream(outputPath, { encoding: 'utf8' })
      }
      count++
      if (!(count % 500)) process.stdout.write(`Converted ${count} rows...\r`)
      const row = convertRow(data)
      results.push(row)
      if (!(results.length % maxFileSize)) {
        await close(results)
      }
    }).on('end', async () => {
      lastFile = true
      await close(results)
      resolve()
    })
    function close(res) {
      return new Promise(next => {
        output.write(JSON.stringify(res))
        output.end()
        output.on('finish', () => {
          fileNumber++
          output = null
          results = []
          next()
        })
      })
    }
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
