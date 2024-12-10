const mongoose = require('mongoose')

const { countConnect } = require('../helpers/check.connect.cjs')
const {
  app: { user, password, url, appname },
  db: { name }
} = require('../configs/config.mongodb.cjs')

const connectString = `mongodb+srv://truongtoan00189:hAWT4jvSPyzMs9C0@cluster0.il30m.mongodb.net/realtimechat?retryWrites=true&w=majority&appName=Cluster0`

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    mongoose
      .connect(connectString)
      .then((_) => console.log('mongoDB connected pro ', countConnect(), connectString))
      .catch((err) => console.log('mongDB error ' + err))
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongDB = Database.getInstance()
module.exports = instanceMongDB
