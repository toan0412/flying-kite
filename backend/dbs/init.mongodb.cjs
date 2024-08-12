const mongoose = require("mongoose");
const {countConnect} = require('../helpers/check.connect.cjs');
const { app: { user, password, url, appname }, db: { name } } = require('../configs/config.mongodb.cjs');

const connectString = `mongodb+srv://${user}:${password}@${url}/${name}?retryWrites=true&w=majority&appName=${appname}`;

console.log(connectString)


class Database {
    constructor() {
        this.connect();
    }

    connect(type = 'mongodb') {
        mongoose.connect(connectString)
        .then(_ => console.log('mongoDB connected pro ', countConnect(), connectString))
        .catch(err => console.log('mongDB error ' + err));
    }
    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongDB = Database.getInstance();
module.exports = instanceMongDB;