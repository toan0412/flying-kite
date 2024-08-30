const mongoose = require('mongoose')
const { countConnect } = require('../helpers/check.connect.cjs')
const {
  app: { user, password, url, appname },
  db: { name }
} = require('../configs/config.mongodb.cjs')

const connectString = `mongodb+srv://${user}:${password}@${url}/${name}?retryWrites=true&w=majority&appName=${appname}`

class Database {
  constructor() {
    this.connect()
  }

  async updateAllDocuments() {
    try {
      const db = mongoose.connection.db
      const collection = db.collection('Messages')
      // Cập nhật tất cả các tài liệu trong collection
      const result = await collection.updateMany(
        {}, // Lọc tất cả các tài liệu
        { $set: { isDelete: false } } // Thêm trường isDelete với giá trị mặc định false
      )

      console.log(`${result.modifiedCount} documents were updated.`)
    } catch (err) {
      console.error('Error updating documents:', err)
    }
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
this.updateAllDocuments()
module.exports = instanceMongDB
