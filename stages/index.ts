import logger from '../logger'
import downloadFiles from './download-files'
import parseLinks from './parse-links'
import processFiles from './process-files'
import syncWithDb from './sync-with-db'

export default async stages => {
  // // // Parse and save latest NPI files
  logger.info('======= Links search started... =======')
  await parseLinks()
  logger.info('======= Links search finished! =======')
  // //
  // // // // // Download latest NPI files
  logger.info('======= Files downloading started... =======')
  await downloadFiles(stages)
  logger.info('======= Files downloading finished! =======')
  // //
  // // // Prepare files to be imported to db
  logger.info('======= Start files processing... =======')
  await processFiles(stages)
  logger.info('======= Files processing finished! =======')

  // // Import data to db
  logger.info('======= Start data sync with MongoDB... =======')
  await syncWithDb(stages)
  logger.info('======= Data sync finished! =======')
}
