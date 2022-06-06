import * as mongodb from 'mongodb'
import * as assert from 'assert'

export const MongoClient = mongodb.MongoClient
export const dbName = 'dictionary'
export const url = 'mongodb://127.0.0.1:27017'

export const iter_dic = async (db, colName) => {

    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            return
        }
        console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    let docs = []
    await col.find().forEach(element => {
        console.log(element)
        docs.push(element)
    });
    return docs
}

const LookforInDic = (colName) => {

    MongoClient.connect(url, async (err, client) => {

        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing

        let docs = await iter_dic(db, colName)
        console.log(docs.length)

        for (const doc of docs) {
            for (let k of Object.keys(doc)) {
                const v = doc[k]
                console.log("%s: %s", k, v)
            }
            console.log('----------------------------------------------------------------------------')
        }

        await client.close()
    })

}

// LookforInDic('pathval')