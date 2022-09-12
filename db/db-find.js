import { assign, isNumeric, xpath2object, linkify } from './tool.js'
import flatten from 'flat'
import { MongoClient, dbName, url } from './shared.js'

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
        // console.log(`${err.codeName}, use existing collection - ${colName}`)
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
    // console.log(query)

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
    // console.log(out)

    if (single) {
        return await col.findOne(query, { projection: out })
    }
    return await col.find(query, { projection: out }).toArray()
}

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

const list_entity = async (db, colName, lookfor) => {

    /*
    * only for entity search    
    */

    // default is get all entity files
    // let attr = ''
    // let value = ''

    // get aimed reg entity files
    // if (lookfor !== undefined && lookfor.length > 0) {
    //     attr = 'Entity'
    //     value = lookfor
    // }

    // let result = await find_dic(db, colName, false, false, attr, value, 'Entity')
    // const entities = []
    // for (const item of result) {
    //     entities.push(item.Entity)
    // }
    // return entities.sort()

    /*******************************************************************************/

    /*
    * all field value search
    */

    if (lookfor === undefined || lookfor.length === 0) {
        let result = await find_dic(db, colName, false, false, '', '', 'Entity')
        const entities = []
        for (const item of result) {
            entities.push(item.Entity)
        }
        return entities.sort()
    }

    const entities = []
    {
        let attrs = []
        let value = lookfor

        let docs = await iter_dic(db, colName)
        // console.log(docs.length)
        for (const doc of docs) {
            for (let k of Object.keys(doc)) {
                attrs.push(k)
            }
        }
        for (const attr of attrs) {
            for (const item of await find_dic(db, colName, false, false, attr, value, 'Entity')) {
                entities.push(item.Entity)
            }
        }
    }

    let uniq = a => [...new Set(a)]
    return uniq(entities.sort())
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

    P.title = 'National Education Data Dictionary'
    P.entity_list = []
    P.collection_list = []

    P.typeCont = ""

    P.contEnt = null
    P.contCol = null

    P.entity = ''
    P.definition = ''
    P.sif = []
    P.otherStandards = []
    P.legalDefinitions = []
    P.collections = []
    P.metadata = null // Identifier, OtherNames, Type, ExpectedAttributes, DefaultParent, Superclass, CrossrefEntities
    P.url = []
    P.entities = []

    P.navPathCol = []       // class(db) -> entity(key) -> { Branch 'Split' }
    P.navPathChildren = []  // class(db) -> entity(key) -> { Children }
    P.error = ''
}

export const OnList = async (lookfor, fnReady) => {

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        console.log('------------------------- < OnList > -------------------------')

        {
            P.entity_list = await list_entity(db, 'entities', lookfor)
            P.collection_list = await list_entity(db, 'collections', lookfor)
            P.contEnt = null
            P.contCol = null
        }

        fnReady(P, 200)

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

export const OnFind = async (value, fnReady) => {

    try {
        const client = await MongoClient.connect(url)
        const db = client.db(dbName) // create if not existing

        console.log('------------------------- < OnFind > -------------------------')

        let status = 404
        let click_mode = true

        ////////////////////////////////////////////////////////////////////////////////////////
        // Refresh List
        ////////////

        if (!value.endsWith("$") && !value.endsWith("#")) {
            P.entity_list = await list_entity(db, 'entities', value)
            P.collection_list = await list_entity(db, 'collections', value)
            click_mode = false
        }

        if (P.entity_list.length > 0 || P.collection_list.length > 0) {
            status = 200

            if (click_mode) {
                value = value.replace("$", "").replace("#", "")
            } else {
                if (P.collection_list.length > 0) {
                    value = P.collection_list[0]
                }
                if (P.entity_list.length > 0) { // make the first entity as default
                    value = P.entity_list[0]
                }
            }

        } else {

            P.contEnt = null
            P.contCol = null
            P.error = `Could NOT find: ${value}`
        }

        ////////////////////////////////////////////////////////////////////////////////////////
        // Content
        ////////////

        let search = ''

        if (value.length > 0 && status == 200) {

            let cont = await find_dic(db, 'entities', true, true, 'Entity', value)
            if (cont != null) {
                console.log('------------------------- < GOT Entity CONTENT > -------------------------')

                search = cont.Entity

                P.typeCont = "entity"
                P.contEnt = cont

                assign(P, 'entity', cont.Entity, "")
                assign(P, 'definition', cont.Definition, "")
                assign(P, 'sif', cont.SIF, [])
                assign(P, 'otherStandards', cont.OtherStandards, [])
                assign(P, 'legalDefinitions', cont.LegalDefinitions, [])
                assign(P, 'collections', cont.Collections, [])
                assign(P, 'metadata', cont.Metadata, null)

            } else {

                cont = await find_dic(db, 'collections', true, true, 'Entity', value)
                if (cont != null) {
                    console.log('------------------------- < GOT Collection CONTENT > -------------------------')

                    search = cont.Entity

                    P.typeCont = "collection"
                    P.contCol = cont

                    assign(P, 'entity', cont.Entity, "")
                    assign(P, 'definition', cont.Definition, "")

                    cont.URL.forEach((e, i, arr) => { arr[i] = linkify(e) })
                    assign(P, 'url', cont.URL, [])
                    assign(P, 'metadata', cont.Metadata, null)

                    let m = await find_dic(db, 'colentities', true, true, '', '')
                    assign(P, 'entities', m[value], null)
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////
        // NavPath
        /////////

        if (search.length > 0 && status == 200) {

            let field = search.replaceAll(".", "[dot]")

            const cont = await find_dic(db, 'class', true, true, '', null, field)

            // console.log("\n----- DEBUG----- >>", cont)

            P.navPathCol = []
            P.navPathChildren = []

            if (Object.keys(cont).length === 0) {

                P.navPathCol = [field]
                P.navPathChildren = []

            } else {

                P.navPathCol = cont[field]['Branch'].split('--')
                P.navPathChildren = cont[field]['Children']
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////

        fnReady(P, status)

        await client.close()

    } catch (err) {
        console.log(err)
    }
}

// (async () => {
//     try {
//         const client = await MongoClient.connect(url)
//         const db = client.db(dbName) // create if not existing
//         let m = await find_dic(db, 'colentities', true, true, '', '')
//         console.log(m)
//         await client.close()
//     } catch (err) {
//         console.log(err)
//     }
// })()