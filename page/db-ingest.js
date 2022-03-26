import * as mongodb from 'mongodb'
import * as assert from 'assert'
import { getFileContent, getDir } from './tool.js'
import * as path from 'path'

const MongoClient = mongodb.MongoClient

const dbName = 'dictionary'
const url = 'mongodb://127.0.0.1:27017'
// const url = 'mongodb://127.0.0.1:27017' + '/' + dbName

const insert_file = async (db, colName, filepath) => {
    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            return
        }
        console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    const data = await getFileContent(filepath)
    const obj = JSON.parse(data)

    // await col.insertOne(obj)
    await col.updateOne({ Entity: obj.Entity }, { $set: obj }, { upsert: true })
}

MongoClient.connect(url, async (err, client) => {
    assert.equal(null, err)
    console.log("Connected successfully to server")

    const db = client.db(dbName) // create if not existing

    const colName = 'entity'

    const data_path = '../data/preproc/out'
    const names = await getDir(data_path)
    console.log(names)

    for (let filename of names) {
        const filepath = path.join(data_path, filename)
        console.log("storing: " + filepath)
        await insert_file(db, colName, filepath)
    }

    client.close()
})
