import { writeFileSync, existsSync, readFileSync } from 'fs'
import _ from 'lodash'
import logger from '../logger'

export const STATE_KEYS = {
  LAST_WEEKLY: 'LAST_WEEKLY',
  LAST_MONTHLY: 'LAST_MONTHLY',
  LAST_DEACTIVATED: 'LAST_DEACTIVATED',
}
const initialState: SharedState = {
  [STATE_KEYS.LAST_WEEKLY]: '',
  [STATE_KEYS.LAST_MONTHLY]: '',
  [STATE_KEYS.LAST_DEACTIVATED]: '',
}
const stateFilePath = './data/state.json'
let state: SharedState = {}

function initState(): SharedState {
  try {
    if (existsSync(stateFilePath)) {
      logger.info('<< State initialized >>')
      state = _.merge(initialState, JSON.parse(readFileSync(stateFilePath)))
    } else {
      logger.info('<< State created >>')
      writeFileSync(stateFilePath, JSON.stringify(initialState), { flag: 'wx' })
    }
  } catch (e) {
    logger.error(e)
  }
  return state
}

function getState(): SharedState {
  return state
}

function setState(data: SharedState): SharedState {
  state = _.merge(getState(), data)
  writeFileSync(stateFilePath, JSON.stringify(state))
  logger.info(`< State updated >
  ${JSON.stringify(state, null, '\t')}
  `)
  return state
}

export { initState, getState, setState }
