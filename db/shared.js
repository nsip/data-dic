import * as mongodb from 'mongodb'

export const MongoClient = mongodb.MongoClient
export const dbName = 'dictionaryTest'
export const url = 'mongodb://127.0.0.1:27017'
// const url = 'mongodb://127.0.0.1:27017' + '/' + dbName