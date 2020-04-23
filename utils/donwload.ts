import { createWriteStream } from 'fs'
import { get } from 'https'
import { basename } from 'path'
import { parse } from 'url'
import _ from 'lodash'
import logger from '../logger'

const TIMEOUT = 10000

export default (url, path) => {
  const uri = parse(url)
  if (!path) {
    if (typeof uri.path === 'string') {
      path = basename(uri.path)
    }
  }
  const file = createWriteStream(path)

  return new Promise(((resolve, reject) => {
    const request = get(uri.href).on('response', res => {
      const len = parseInt(_.get(res, 'headers.content-length', 0), 10)
      let downloaded = 0
      let percent = '0'
      res
        .on('data', chunk => {
          file.write(chunk)
          downloaded += chunk.length
          percent = ((100.0 * downloaded) / len).toFixed(2)
          process.stdout.write(`Downloading ${percent}% ${downloaded} bytes\r`)
        })
        .on('end', () => {
          file.end()
          logger.info(`${uri.path} downloaded to: ${path}`)
          resolve()
        })
        .on('error', err => {
          reject(err)
        })
    })
    request.setTimeout(TIMEOUT, () => {
      request.abort()
      reject(new Error(`request timeout after ${TIMEOUT / 1000.0}s`))
    })
  }))
}
