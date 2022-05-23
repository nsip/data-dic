import * as mongodb from 'mongodb'
import * as assert from 'assert'
import { assign, isNumeric, xpath2object, linkify } from './tool.js'

export const MongoClient = mongodb.MongoClient
export const dbName = 'dictionary'
export const url = 'mongodb://127.0.0.1:27017'
// const url = 'mongodb://127.0.0.1:27017' + '/' + dbName

// const find_entity = async (db, colName, entity) => {
//     try {
//         await db.createCollection(colName)
//     } catch (err) {
//         if (err.codeName != 'NamespaceExists') {
//             return
//         }
//         console.log(`${err.codeName}, use existing collection - ${colName}`)
//     }
//     const col = db.collection(colName)
//     return col.findOne({ Entity: entity })
// }

export const find_dic = async (db, colName, oneFlag, attr, value, ...out_attrs) => {

    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            return
        }
        console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    let query = {}
    if (attr !== '' && value !== null) {

        // escape original regex symbols
        value = value.replaceAll('(', '\\(')
        value = value.replaceAll(')', '\\)')

        // regex for case insensitive
        const rVal = new RegExp('^' + value + '$', 'i')

        // make query object 
        // query = { [attr]: rVal }
        query = await xpath2object(attr, rVal)
    }
    console.log(query)

    if (out_attrs.length == 0) {
        if (oneFlag) {
            return await col.findOne(query)
        }
        return await col.find(query).toArray()
    }

    const out = { _id: 0 }
    for (const oa of out_attrs) {
        out[oa] = true
    }
    console.log(out)

    if (oneFlag) {
        return await col.findOne(query, { projection: out })
    }
    return await col.find(query, { projection: out }).toArray()
}

const list_entity = async (db, colName) => {
    let result = await find_dic(db, colName, false, '', '', 'Entity')
    const entities = []
    for (const item of result) {
        entities.push(item.Entity)
    }
    return entities.sort()
}

// referred by 'render.js'
// MongoClient.connect(url, async (err, client) => {
//     assert.equal(null, err)
//     console.log("Connected successfully to server")

//     const db = client.db(dbName) // create if not existing
//     const colName = 'entity'

//     // const item = await find_dic(db, colName, false, 'Entity', 'School', 'Type', 'Collections')
//     // const item = await find_dic(db, colName, false, '', '', 'Type', 'Entity', 'Collections')
//     // console.log(item)
//     // console.log(item.Collections[0].Elements[0])

//     const entities = await list_entity(db, colName)
//     console.log(entities)

//     await client.close()
// })

export const P = {}

export const InitP = () => {

    P.title = 'Education Data Dictionary'
    P.entities = []
    P.content = null

    P.entity = ''
    P.definition = ''
    P.sif = []
    P.otherStandards = []
    P.legalDefinitions = []
    P.collections = []
    P.metadata = null // Identifier, OtherNames, Type, ExpectedAttributes, DefaultParent, Superclass, CrossrefEntities

    P.error = ''
    P.navPathCol = [] // [ [], []... ]
}

export const OnListEntity = async (fnReady) => {

    MongoClient.connect(url, async (err, client) => {

        console.log('------------------------- < OnListEntity > -------------------------')

        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing

        {
            P.entities = await list_entity(db, 'entity')
            P.content = null
        }

        fnReady(P, 200)

        await client.close()
    })

}

export const OnFindEntity = async (value, fnReady) => {

    MongoClient.connect(url, async (err, client) => {

        console.log('------------------------- < OnFindEntity > -------------------------')

        assert.equal(null, err)
        console.log("Connected successfully to server")

        let status = 200
        let searchEntity = ''

        const db = client.db(dbName) // create if not existing

        ////////////////////////////////////////////////////////////////////////////////////////
        // Refresh List
        ////////////

        P.entities = await list_entity(db, 'entity')

        ////////////////////////////////////////////////////////////////////////////////////////
        // Content
        ////////////        

        let field = 'Entity'
        if (isNumeric(value)) { // const idNum = value.replaceAll(/^0+|0+$/g, '')
            field = 'Identifier'
            value = String(value).padStart(4, '0')
        }
        // console.log("-------------", field, ":", value)

        //////////////////////////////

        let cont = await find_dic(db, 'entity', true, field, value)
        if (cont == null) {

            console.log('------------------------- < NULL ENTITY > -------------------------')

            {
                P.content = null
                P.error = `could NOT find ${value} for ${field}`
            }

            status = 404

        } else {

            console.log('------------------------- < GOT CONTENT > -------------------------')

            {
                P.content = cont

                searchEntity = cont.Entity

                assign(P, 'entity', cont.Entity, "")

                assign(P, 'definition', cont.Definition, "")

                assign(P, 'sif', cont.SIF, [])

                assign(P, 'otherStandards', cont.OtherStandards, [])

                assign(P, 'legalDefinitions', cont.LegalDefinitions, [])

                assign(P, 'collections', cont.Collections, [])

                assign(P, 'metadata', cont.Metadata, null)
            }

            status = 200
        }

        ////////////////////////////////////////////////////////////////////////////////////////
        // Path
        /////////

        if (searchEntity !== '') {

            field = searchEntity
            field = field.replaceAll(".", "^DOT")

            cont = await find_dic(db, 'class', true, '', null, field)

            // console.log("\n-----", cont)

            if (Object.keys(cont).length === 0) {

                P.navPathCol = []
                P.defParent = ''

            } else {

                const pathCol = cont[field]
                if (Array.isArray(pathCol)) {
                    P.navPathCol = []
                    for (let path of pathCol) {
                        P.navPathCol.push(path.split('--'))
                    }
                }
                if ('navPathCol' in P && P.navPathCol.length > 0) {
                    const firstPathCol = P.navPathCol[0]
                    if ('length' in firstPathCol && firstPathCol.length > 1) {
                        P.defParent = firstPathCol[firstPathCol.length - 2]
                    }
                }

            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////

        fnReady(P, status)

        await client.close()
    })
}