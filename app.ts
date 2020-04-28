import { CronJob } from 'cron'
import config from './config'
import stages from './stages'
import { initState, STATE_KEYS } from './utils/state'

initState()

const { HARD_UPDATE } = config
const { LAST_DEACTIVATED, LAST_WEEKLY, LAST_MONTHLY } = STATE_KEYS

let job = new CronJob({
  cronTime: '0 0 * * 0', // Once a week
  onTick: () => stages([LAST_DEACTIVATED, LAST_WEEKLY]),
  runOnInit: true,
})

if (HARD_UPDATE) stages([LAST_MONTHLY])

job.start()
