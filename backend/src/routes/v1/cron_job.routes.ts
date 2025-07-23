import express from 'express'
import { cronJobController } from '~/controllers/cron_job.controller'

const Router = express.Router()

Router.route('/')
  .post(cronJobController.createCronJob)
  .get(cronJobController.fetchAllCronJobs)

Router.route('/:cronJobId')
  .get(cronJobController.fetchCronJobById)
  .patch(cronJobController.updateCronJob)
  .delete(cronJobController.deleteCronJob)

export const cronJobRoute = Router