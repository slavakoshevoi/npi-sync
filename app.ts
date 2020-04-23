import { CronJob } from 'cron'
import stages from './stages'
import { initState } from './utils/state'

initState()

let job = new CronJob({
  cronTime: '0 0 * * *',
  onTick: stages,
  runOnInit: true,
})

job.start()
