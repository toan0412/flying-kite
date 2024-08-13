const express = require('express')
const compression = require('compression')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const router = require('./routes/index.cjs')
const cors = require('cors');

const app = express()

// Cài đặt middleware
app.use(morgan('dev')); // Ghi log cho môi trường phát triển
app.use(helmet()); // Bảo mật HTTP headers
app.use(compression()); // Nén response để cải thiện hiệu suất

// Phân tích JSON body và URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  credentials: true,
  origin: '*'
}));


// init db
require('./dbs/init.mongodb.cjs')

// init routes
app.use('/', router)

// handle error
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  const statusCode = err.status || 500
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: err.message || 'Internal Server Error'
  })
})

module.exports = app
