import * as mongodb from 'mongodb'
import * as assert from 'assert'

const MongoClient = mongodb.MongoClient
const dbName = 'dictionary'
const url = 'mongodb://127.0.0.1:27017'

export const iter_dic = async (db, colName) => {

    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            return
        }
        // console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    let docs = []
    await col.find().forEach(element => {
        // console.log(element)
        docs.push(element)
    });
    return docs
}

const LookforInDic = async (colName) => {

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        let docs = await iter_dic(db, colName)
        // console.log(docs.length)

        for (const doc of docs) {
            for (let k of Object.keys(doc)) {
                const v = doc[k]
                // console.log("%s: %s", k, v)
            }
            console.log('----------------------------------------------------------------------------')
        }

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

// await LookforInDic('pathval')