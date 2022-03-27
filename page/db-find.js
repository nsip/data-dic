import * as mongodb from 'mongodb'
import * as assert from 'assert'
import { assign, xpath2object, css_p_cls_inject, css_ol_cls_inject, css_ola_cls_inject, css_ol1_cls_inject, linkify } from './tool.js'

const MongoClient = mongodb.MongoClient
const dbName = 'dictionary'
const url = 'mongodb://127.0.0.1:27017'
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

const find_dic = async (db, colName, oneFlag, attr, value, ...out_attrs) => {
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
    if (attr !== '') {
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
            return col.findOne(query)
        } else {
            return col.find(query).toArray()
        }
    }

    const out = { _id: 0 }
    for (const oa of out_attrs) {
        out[oa] = true
    }
    console.log(out)

    if (oneFlag) {
        return col.findOne(query, { projection: out })
    } else {
        return col.find(query, { projection: out }).toArray()
    }
}

const list_entity = async (db, colName) => {
    let result = await find_dic(db, colName, false, '', '', 'Entity')
    const entities = []
    for (const item of result) {
        entities.push(item.Entity)
    }
    return entities.sort()
}

// referred by 'page-render.js'
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

//     client.close()
// })

export let PO = {
    entities: [],
    content: null,

    title: 'Education Data Dictionary',
    entity: "",
    collections: [],
    crossrefEntities: [],
    definition: "",
    expectedAttributes: [],
    identifier: "",
    legalDefinitions: [],
    otherNames: [],
    otherStandards: [],
    sif: [],
    superclass: [],
    type: [],
}

export const OnListEntity = async (fnReady) => {
    MongoClient.connect(url, async (err, client) => {
        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing
        const colName = 'entity'

        {
            PO.entities = await list_entity(db, colName)
            PO.content = null
        }

        fnReady(PO, 200)

        client.close()
    })
}

export const OnFindEntity = async (value, fnReady) => {
    MongoClient.connect(url, async (err, client) => {
        assert.equal(null, err)
        console.log("Connected successfully to server")

        const db = client.db(dbName) // create if not existing
        const colName = 'entity'

        const cont = await find_dic(db, colName, true, 'Entity', value)
        if (cont == null) {

            console.log('--- NULL CONTENT ---')

            {
                PO.content = null
            }

            fnReady(PO, 404)

        } else {

            console.log('--- HAS CONTENT ---')

            {
                PO.content = cont

                assign(PO, 'entity', cont.Entity, "")

                assign(PO, 'collections', cont.Collections, [])
                for (let i = 0; i < PO.collections.length; i++) {
                    assign(PO.collections[i], 'Elements', cont.Collections[i].Elements, [])
                    assign(PO.collections[i], 'BusinessRules', cont.Collections[i].BusinessRules, [])
                }

                assign(PO, 'crossrefEntities', cont.CrossrefEntities, [])

                assign(PO, 'definition', cont.Definition, "", css_p_cls_inject, '\"inner-p1\"')

                assign(PO, 'expectedAttributes', cont.ExpectedAttributes, [])

                assign(PO, 'identifier', cont.Identifier, "")

                assign(PO, 'legalDefinitions', cont.LegalDefinitions, [])
                for (let i = 0; i < PO.legalDefinitions.length; i++) {

                    PO.legalDefinitions[i].Link = linkify(PO.legalDefinitions[i].Link)

                    assign(PO.legalDefinitions[i], 'Definition', cont.LegalDefinitions[i].Definition, "", css_p_cls_inject, '\"inner-p2\"')

                    assign(PO.legalDefinitions[i], 'Definition', PO.legalDefinitions[i].Definition, "", css_ol_cls_inject, '\"inner-ol1\"')

                    assign(PO.legalDefinitions[i], 'Definition', PO.legalDefinitions[i].Definition, "", css_ol1_cls_inject, '\"inner-ol1\"')

                    switch (PO.legalDefinitions[i].LegislationName) {

                        case 'Commonwealth Education Act 2013':
                            assign(PO.legalDefinitions[i], 'Definition', PO.legalDefinitions[i].Definition, "", css_ola_cls_inject, '\"inner-ola-1\"')
                            break;

                        case 'Education Regulations 2013':
                            assign(PO.legalDefinitions[i], 'Definition', PO.legalDefinitions[i].Definition, "", css_ola_cls_inject, '\"inner-ola-2\"')
                            break;

                        case 'EDUCATION ACT 2004 (ACT)':
                            assign(PO.legalDefinitions[i], 'Definition', PO.legalDefinitions[i].Definition, "", css_ola_cls_inject, '\"inner-ola-2\"')
                            break;

                        case 'EDUCATION AND EARLY CHILDHOOD SERVICES (REGISTRATION AND STANDARDS) ACT 2011 (SA)':
                            assign(PO.legalDefinitions[i], 'Definition', PO.legalDefinitions[i].Definition, "", css_ola_cls_inject, '\"inner-ola-1\"')
                            break;

                        case '':
                            break;
                    }
                }

                assign(PO, 'otherNames', cont.OtherNames, [])

                assign(PO, 'otherStandards', cont.OtherStandards, [])
                for (let i = 0; i < PO.otherStandards.length; i++) {
                    PO.otherStandards[i].Link = linkify(PO.otherStandards[i].Link)
                }

                assign(PO, 'sif', cont.SIF, [])

                assign(PO, 'superclass', cont.Superclass, [])

                assign(PO, 'type', cont.Type, "")
            }
            fnReady(PO, 200)

        }

        client.close()
    })
}