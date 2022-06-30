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
        // console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    const data = await getFileContent(filepath)
    const obj = JSON.parse(data)

    // if (filepath.includes('path_val')) {
    //     console.log("%o", obj)
    // }

    // await col.insertOne(obj)
    await col.updateOne({ Entity: obj.Entity }, { $set: obj }, { upsert: true })
}

// dirPath: '../data/out'
export const ingestEntity = async (dirPath, colName) => {

    if (colName.length == 0) {
        colName = 'entity'
    }

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        const names = await getDir(dirPath)
        // console.log(names)

        for (let filename of names) {
            if (filename === 'class-link.json' ||
                filename === 'path_val' ||
                filename === 'collections' ||
                filename === 'collection-entities.json'
            ) { // this doc & folder will be put into 'class' & 'pathval' collection, rather than 'entity'
                continue
            }
            const filepath = path.join(dirPath, filename)
            // console.log("storing: " + filepath)
            await insert_file(db, colName, filepath)
        }

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

// linkFilePath: '../data/out/class-link.json'
export const ingestClassLinkage = async (linkFilePath, colName) => {

    if (colName.length == 0) {
        colName = 'class'
    }

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        // console.log("storing: " + linkFilePath)
        await insert_file(db, colName, linkFilePath)

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

export const ingestCollectionEntities = async (linkFilePath, colName) => {

    if (colName.length == 0) {
        colName = 'colentities'
    }

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        // console.log("storing: " + linkFilePath)
        await insert_file(db, colName, linkFilePath)

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

// dirPath: '../data/out/path_val'
export const ingestEntityPathVal = async (dirPath, colName) => {

    if (colName.length == 0) {
        colName = 'pathval'
    }

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        const names = await getDir(dirPath)
        // console.log(names)

        for (let filename of names) {
            const filepath = path.join(dirPath, filename)
            // console.log("storing: " + filepath)
            await insert_file(db, colName, filepath)
        }

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

export const ingestCollection = async (dirPath, colName) => {

    if (colName.length == 0) {
        colName = 'collection'
    }

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        const names = await getDir(dirPath)
        // console.log("===>", names)

        for (let filename of names) {
            if (filename === 'class-link.json' ||
                filename === 'path_val' ||
                filename === 'collection-entities.json') { // this doc & folder will be put into 'class' & 'pathval' collection
                continue
            }
            const filepath = path.join(dirPath, filename)
            // console.log("storing: " + filepath)
            await insert_file(db, colName, filepath)
        }

        await client.close()

    } catch (err) {
        console.log(err)
    }
}