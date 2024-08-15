const { apiKey, permission } = require('../auth/checkAuth.cjs');
const accessRoutes = require('./access/index.cjs')
const roomRoutes = require('./room/index.cjs')
const messageRoutes = require('.//message/index.cjs')

const router = require('express').Router()
router.use('/v1/api', apiKey, permission('0000'), accessRoutes)
router.use('/v1/api', apiKey, permission('0000'), roomRoutes)
router.use('/v1/api', apiKey, permission('0000'), messageRoutes)

module.exports = router