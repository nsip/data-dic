import * as mongodb from 'mongodb'
import * as assert from 'assert'
import { xpath2object } from './tool.js'

export const MongoClient = mongodb.MongoClient
export const dbName = 'dictionary'
export const url = 'mongodb://127.0.0.1:27017'

export const del_dic = async (db, colName, oneFlag, attr, value) => {

    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            return
        }
        console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    if (attr != null && attr.length != 0) {

        let query = { [attr]: value }
        if (value !== null) {
            // escape original regex symbols
            value = value.replaceAll('(', '\\(')
            value = value.replaceAll(')', '\\)')

            // regex for case insensitive
            const rVal = new RegExp('^' + value + '$', 'i')

            // make query object 
            query = await xpath2object(attr, rVal)
        }
        console.log("query:", query)

        if (oneFlag) {
            return await col.deleteOne(query)
        }
        return await col.deleteMany(query)

    } else {

        if (!oneFlag) {
            return await col.deleteMany({})
        }

    }
}

// delete empty Entity
// MongoClient.connect(url, async (err, client) => {

//     assert.equal(null, err)
//     console.log("Connected successfully to server")

//     const db = client.db(dbName) // create if not existing
//     const colName = 'entity'

//     const delquery = await del_dic(db, colName, false, 'Entity', null)
//     console.log(delquery)

//     await client.close()
// })

export const DelEntities = (...rmEntities) => {

    rmEntities.forEach(entity => {

        MongoClient.connect(url, async (err, client) => {

            assert.equal(null, err)
            console.log("Connected successfully to server")

            const db = client.db(dbName) // create if not existing
            const colName = 'entity'

            const delquery = await del_dic(db, colName, true, 'Entity', entity)
            console.log(delquery)

            await client.close()
        })

    })
}

export const DelAllFiles = (colName) => {

    MongoClient.connect(url, async (err, client) => {

        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing

        const delquery = await del_dic(db, colName, false, null, null)
        console.log(delquery)

        await client.close()
    })

}

DelAllFiles('entity')
DelAllFiles('class')

