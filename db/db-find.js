import * as mongodb from 'mongodb'
import * as assert from 'assert'
import { assign, isNumeric, xpath2object, linkify } from './tool.js'
import flatten from 'flat'

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

export const find_dic = async (db, colName, single, strict, attr, value, ...out_attrs) => {

    try {
        await db.createCollection(colName)
    } catch (err) {
        if (err.codeName != 'NamespaceExists') {
            return
        }
        console.log(`${err.codeName}, use existing collection - ${colName}`)
    }
    const col = db.collection(colName)

    // console.log(attr)
    // console.log(value)

    let query = {}
    if (attr !== '' && value !== null) {

        // escape original regex symbols
        value = value.replaceAll('(', '\\(')
        value = value.replaceAll(')', '\\)')

        // regex for case insensitive, any part of word
        let rVal = new RegExp('(^|\\s+)' + value + '(\\s+|$)', 'i') // filter mode

        if (strict) {
            // regex for case insensitive, whole word
            rVal = new RegExp('^' + value + '$', 'i')               // click mode
        }

        // make query object 
        query = { [attr]: rVal } // this one is "Query on Nested Field" 
        // query = await xpath2object(attr, rVal) // this one is "Match an Embedded/Nested Document"
    }
    console.log(query)

    if (out_attrs.length == 0) {
        if (single) {
            return await col.findOne(query)
        }
        return await col.find(query).toArray()
    }

    const out = { _id: 0 }
    for (const oa of out_attrs) {
        out[oa] = true
    }
    console.log(out)

    if (single) {
        return await col.findOne(query, { projection: out })
    }
    return await col.find(query, { projection: out }).toArray()
}

const list_entity = async (db, colName, aimEntities) => {

    // default is get all entity files
    let attr = ''
    let value = ''

    // get aimed reg entity files
    if (aimEntities !== undefined && aimEntities.length > 0) {
        attr = 'Entity'
        value = aimEntities
    }

    let result = await find_dic(db, colName, false, false, attr, value, 'Entity')
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

//     // const item = await find_dic(db, colName, false, false, 'Entity', 'School', 'Type', 'Collections')
//     // const item = await find_dic(db, colName, false, false, '', '', 'Type', 'Entity', 'Collections')
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

export const OnListEntity = async (aimEntities, fnReady) => {

    MongoClient.connect(url, async (err, client) => {

        console.log('------------------------- < OnListEntity > -------------------------')

        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing

        {
            P.entities = await list_entity(db, 'entity', aimEntities)
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
        let click_mode = true

        ////////////////////////////////////////////////////////////////////////////////////////
        // Refresh List
        ////////////

        if (!value.endsWith("$")) {
            P.entities = await list_entity(db, 'entity', value)
            click_mode = false
        }

        value = value.replace("$", "")

        ////////////////////////////////////////////////////////////////////////////////////////
        // Content
        ////////////

        let field = ''
        let cont = null

        if (value.length > 0) {

            field = 'Entity'
            if (isNumeric(value)) { // const idNum = value.replaceAll(/^0+|0+$/g, '')
                field = 'Metadata.Identifier'
                value = String(value).padStart(8, '0')
            }

            cont = await find_dic(db, 'entity', true, click_mode, field, value)
            if (cont == null) {

                console.log('------------------------- < NULL ENTITY > -------------------------')

                {
                    P.content = null
                    P.error = `Could NOT find: ${value} from ${field}`
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

        }

        ////////////////////////////////////////////////////////////////////////////////////////
        // Path
        /////////

        if (searchEntity.length > 0) {

            field = searchEntity
            field = field.replaceAll(".", "^DOT")

            cont = await find_dic(db, 'class', true, true, '', null, field)

            // console.log("\n-----", cont)

            if (Object.keys(cont).length === 0) {

                P.navPathCol = []                   // pathCol is 2D array
                P.navPathCol.push([field])

            } else {

                const pathCol = cont[field]
                if (Array.isArray(pathCol)) {
                    P.navPathCol = []
                    for (let path of pathCol) {
                        P.navPathCol.push(path.split('--'))
                    }
                }

            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////

        fnReady(P, status)

        await client.close()
    })
}