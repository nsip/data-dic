import * as mongodb from 'mongodb'
import * as assert from 'assert'
import { getFileContent } from '../tool.js'

const MongoClient = mongodb.MongoClient

const dbName = 'komablog'
const url = 'mongodb://127.0.0.1:27017'
// const url = 'mongodb://127.0.0.1:27017' + '/' + dbName

const insert_file = async (db, colName, filepath) => {
    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            await client.close()
            return
        }
        console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    const data = await getFileContent(filepath)
    const obj = JSON.parse(data)
    await col.insertOne(obj)
}

MongoClient.connect(url, async (err, client) => {
    assert.equal(null, err)
    console.log("Connected successfully to server")

    const db = client.db(dbName) // create if not existing

    //////////////////////////////////////////////////////////

    // const colName = 'AAA'

    // try {
    //     await db.createCollection(colName)
    // } catch (err) {
    //     if (err.codeName != 'NamespaceExists') {
    //         await client.close()
    //         return
    //     }
    //     console.log(err.codeName)
    // }

    // const col = db.collection(colName)

    // for (let i = 0; i < 10; i++) {
    //     const idx = i.toString()
    //     let obj = {
    //         [idx]: i, // [key variable]
    //         idx: i,   // key literal 
    //     }
    //     await col.insertOne(obj)
    // }

    //////////////////////////////////////////////////////////   

    await insert_file(db, 'school', '../data/out/school.json')

    //////////////////////////////////////////////////////////

    await client.close()
})
