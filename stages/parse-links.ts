import axios, { AxiosResponse } from 'axios'
import getHrefs from 'get-hrefs'
import _ from 'lodash'
import moment from 'moment'
import config from '../config'
import logger from '../logger'
import { setState, STATE_KEYS } from '../utils/state'

const testHrefs = [
  'https://www.cms.gov/Regulations-and-Guidance/Administrative-Simplification/NationalProvIdentStand/DataDissemination.html',
  'https://www.cms.gov/Outreach-and-Education/Medicare-Learning-Network-MLN/MLNProducts/Downloads/NPI-What-You-Need-To-Know.pdf',
  // '/NPPES_Data_Dissemination_December_2019.zip',
  // '/NPPES_Data_Dissemination_March_2020.zip',
  // '/NPPES_Data_Dissemination_April_2020.zip',
  '/NPPES_Deactivated_NPI_Report_021420.zip',
  '/NPPES_Deactivated_NPI_Report_031420.zip',
  '/NPPES_Deactivated_NPI_Report_041420.zip',
  '/NPPES_Data_Dissemination_030320_030220_Weekly.zip',
  '/NPPES_Data_Dissemination_040320_040220_Weekly.zip',
  '/NPPES_Data_Dissemination_040620_041220_Weekly.zip',
]

export default async () => {
  const res: AxiosResponse = await axios.get(config.npiFilesParseUrl)
  if (res.status !== 200) {
    return logger.error(`${config.npiFilesUrl} - unavailable`)
  }
  const hrefs = getHrefs(res.data)
  if (_.isEmpty(hrefs)) return logger.error(`${config.npiFilesParseUrl} - hrefs not found`)

  // const hrefs = testHrefs

  const dataLinks = _.filter(hrefs, f => /(\/NPPES_Data_Dissemination).*\.zip+$/.test(f))
  const deactivateLinks = _.filter(hrefs, f => /(\/NPPES_Deactivated).*\.zip+$/.test(f))

  logger.info(`${dataLinks.length + deactivateLinks.length} links found`)

  if (_.isEmpty(dataLinks)) logger.error('Data files not found')
  if (_.isEmpty(deactivateLinks)) logger.warn('Deactivated data not found')

  const monthsRegexp = /(January|February|March|April|May|June|July|August|September|October|November|December)_(\d{4})/
  const dateRegexp = /([0-9]{6})/
  const dateRangeRegexp = /([0-9]{6})_([0-9]{6})/
  const monthlyDataLinks = _.filter(dataLinks, f => monthsRegexp.test(f))
  const weeklyDataLinks = _.filter(dataLinks, f => dateRangeRegexp.test(f))

  if (_.isEmpty(monthlyDataLinks)) logger.error('Monthly data files not found')
  if (_.isEmpty(weeklyDataLinks)) logger.error('Weekly data files not found')

  logger.info(`${deactivateLinks.length} deactivate / ${weeklyDataLinks.length} weekly / ${monthlyDataLinks.length} monthly`)
  const results = { monthly: {}, weekly: {}, deactivated: {} }

  _.each(monthlyDataLinks, link => { results.monthly[moment(link.match(monthsRegexp)[0], 'MMMM_YYYY').valueOf()] = link })
  _.each(weeklyDataLinks, link => { results.weekly[moment(link.match(dateRangeRegexp)[2], 'MMDDYY').valueOf()] = link })
  _.each(deactivateLinks, link => { results.deactivated[moment(link.match(dateRegexp)[0], 'MMDDYY').valueOf()] = link })

  const createDownloadLink = data => (!_.isEmpty(data) ? `${config.npiFilesUrl}${data[_.max(_.map(_.keys(data), Number))]}` : '')
  setState({
    [STATE_KEYS.LAST_MONTHLY]: createDownloadLink(results.monthly),
    [STATE_KEYS.LAST_WEEKLY]: createDownloadLink(results.weekly),
    [STATE_KEYS.LAST_DEACTIVATED]: createDownloadLink(results.deactivated),
  })
}
