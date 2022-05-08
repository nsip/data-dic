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

    let query = { [attr]: value }
    if (attr !== '' && value !== null) {
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

DelEntities(
    'AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG',
    'HHH', 'III', 'JJJ', 'KKK', 'LLL', 'MMM', 'NNN',
    'OOO', 'PPP', 'QQQ', 'RRR', 'SSS', 'TTT', 'UUU',
    'VVV', 'WWW', 'XXX', 'YYY', 'ZZZ',
)
