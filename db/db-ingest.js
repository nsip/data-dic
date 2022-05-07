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

// dirPath: '../data/preproc/out'
export const ingestEntity = (dirPath, colName) => {

    MongoClient.connect(url, async (err, client) => {
        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing

        if (colName.length == 0) {
            colName = 'entity'
        }

        const names = await getDir(dirPath)
        console.log(names)

        for (let filename of names) {
            if (filename === 'class-link.json') { // this doc will be put into 'class' collection, rather than 'entity'
                continue
            }
            const filepath = path.join(dirPath, filename)
            console.log("storing: " + filepath)
            await insert_file(db, colName, filepath)
        }

        await client.close()
    })

}

// ingestEntity('../data/preproc/out', 'entity')

// linkFilePath: '../data/preproc/out/class-link.json'
export const ingestClassLinkage = (linkFilePath, colName) => {

    MongoClient.connect(url, async (err, client) => {
        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing 

        if (colName.length == 0) {
            colName = 'class'
        }

        console.log("storing: " + linkFilePath)
        await insert_file(db, colName, linkFilePath)

        await client.close()
    })

}

// ingestClassLinkage('../data/preproc/out/class-link.json', 'class')
