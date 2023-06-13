const express = require('express')
const router = express.Router()

const {  getAllJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobs')

//Ruta "/api/v1/jobs"
router.route('/').post(createJob).get(getAllJobs);
router.post('/:id').get(getJob).patch(updateJob).delete(deleteJob)

module.exports = router;