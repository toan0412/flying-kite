const config = {
  app: {
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    url: process.env.MONGODB_URL,
    appname: process.env.MONGODB_APPNAME
  },
  db: {
    name: process.env.MONGODB_NAME
  }
}

module.exports = config
