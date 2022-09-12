'use strict'

import ejs from 'ejs'
import fs from 'fs'
// import fsp from 'fs/promises'
// import util from 'util'
// import { createIfNeeded, invoke } from './tool.js'
// import { validateEntity } from './validate.js'
// import { ingestEntity, ingestClassLinkage, ingestEntityPathVal, ingestCollection, ingestCollectionEntities } from '../db/db-ingest.js'
// import { pipeline } from 'stream'
// const pump = util.promisify(pipeline)

import { P, InitP, OnList, OnFind } from '../db/db-find.js'

// running work dir for 'ejs'
const template = fs.readFileSync('./www/dictionary.ejs', 'utf-8')

const render_ejs = (P, code) => {

    const data = ejs.render(template, {

        title: P.title,

        entity_list: P.entity_list,
        collection_list: P.collection_list,

        typeCont: P.typeCont,
        contEnt: P.contEnt,
        contCol: P.contCol,

        entity: P.entity,
        definition: P.definition,
        sif: P.sif,
        otherStandards: P.otherStandards,
        legalDefinitions: P.legalDefinitions,
        collections: P.collections,
        metadata: P.metadata,
        url: P.url,
        entities: P.entities,

        search_value: SearchVal.replace("$", "").replace("#", ""),
        navPathCol: P.navPathCol,
        navPathChildren: P.navPathChildren,
        error: P.error,
    })

    P.res
        .code(code)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(data)
}

let SearchVal = ''
const dfltEntity = '' // 'ACARA ID'

const getValue = (val) => {
    if (val.length == 0) {
        return dfltEntity
    }
    return val
}

export const esa_dic = async (fastify, options) => {

    // https://github.com/fastify/fastify/blob/main/docs/Reference/Request.md

    // console.log('body    ---', req.body)           // from body
    // console.log('query   ---', req.query)          // from url
    // console.log('params  ---', req.params.entity)  // from /url/:entity
    // console.log('headers ---', req.headers)

    // Init page OR OnEdit refresh, param 'search' 
    fastify.get('/', async (req, res) => {

        console.log("\n---------------------INIT---------------------")

        SearchVal = ''

        if ('search' in req.query) {
            SearchVal = req.query.search.trim()
        }

        console.log("SearchVal--->", SearchVal)

        if (SearchVal.length == 0) {

            console.log('---> OnList')

            InitP()
            P.res = res
            await OnList(SearchVal, render_ejs)

        } else {

            console.log('---> OnFind')

            P.error = ''
            P.res = res
            await OnFind(SearchVal, render_ejs)
        }
    })

    // click @ local url href for 'School', 'Campus'
    for (const entity of ['School', 'Campus']) {
        fastify.get(`/${entity}`, async (req, res) => {

            console.log("\n--------------------- CLICK URL ---------------------")

            P.error = ''
            P.res = res

            SearchVal = entity

            await OnFind(SearchVal.trim(), render_ejs)
        })
    }

    // if [entity] is empty, input(text) applies on form submit
    fastify.post(`/:search`, async (req, res) => {

        console.log("\n--------------------- POST SEARCH ---------------------")

        P.error = ''
        P.res = res

        SearchVal = req.params.search // above param string ':search'

        if (SearchVal.length == 0) {
            SearchVal = getValue(req.body.search) // html/ejs input(text type)-name('search').
        }

        await OnFind(SearchVal.trim(), render_ejs)
    })

///////////////////////////////////////////////////////////////////////

    // fastify.post('/new', async (req, res) => {

    //     console.log("\n---------------------NEW ENTITY---------------------\n")

    //     P.error = ''
    //     P.res = res

    //     const filename = req.body.Entity

    //     // console.log("DEBUG: filetype\n", req.query.filetype)
    //     // console.log("DEBUG: body\n", req.body)

    //     createIfNeeded('./data/renamed/')
    //     createIfNeeded('./data/renamed/collections/')

    //     let uploadpath = `data/renamed/${filename}.json`
    //     if (req.query.filetype == 'collection') {
    //         uploadpath = `data/renamed/collections/${filename}.json`
    //     }

    //     fs.writeFile(uploadpath, JSON.stringify(req.body), (err) => {
    //         if (err) {
    //             console.log("-------------------", err)
    //         }
    //     })

    //     // waiting for file saving is finished !
    //     while (!fs.existsSync(uploadpath)) {
    //         await new Promise(resolve => setTimeout(resolve, 50));
    //     }

    //     if (fs.existsSync(uploadpath)) {
    //         await fsp.readFile(uploadpath, { encoding: 'utf8' })
    //     }

    //     // re-preprocess all from '/renamed/', after processing, generated '/out/'
    //     invoke("./preproc", () => {
    //         // re-ingest all
    //         ingestEntity('./data/out', 'entity')
    //         ingestClassLinkage('./data/out/class-link.json', 'class')
    //         ingestEntityPathVal('./data/out/path_val', 'pathval')
    //         ingestCollection('./data/out/collections', 'collection')
    //         ingestCollectionEntities('./data/out/collection-entities.json', 'colentities')
    //     })

    //     ///////////////////////////////////////////////////////////////////////

    //     await OnList(filename, render_ejs)
    // })


    // add Entity from JSON file, form with [enctype="multipart/form-data"] on submit
    // fastify.post('/add', async (req, res) => {

    //     console.log("\n---------------------ADD ENTITY---------------------\n")

    //     P.error = ''
    //     P.res = res

    //     // process a single file, also, consider that if you allow to upload multiple files
    //     // consume all files otherwise the promise will never fulfill
    //     const data = await req.file()

    //     // data.file // stream
    //     // data.fields // other parsed parts
    //     // data.fieldname
    //     // data.filename
    //     // data.encoding
    //     // data.mimetype
    //     // await data.toBuffer() // Buffer

    //     createIfNeeded('./data/renamed/')
    //     createIfNeeded('./data/renamed/collections/')

    //     let uploadpath = `data/renamed/${data.filename}`
    //     if (req.query.filetype == 'collection') {
    //         uploadpath = `data/renamed/collections/${filename}.json`
    //     }

    //     await pump(data.file, fs.createWriteStream(uploadpath))

    //     // be careful of permission issues on disk and not overwrite, sensitive files that could cause security risks
    //     // also, consider that if the file stream is not consumed, the promise will never fulfill

    //     ///////////////////////////////////////////////////////////////////////
    //     // validate inbound entity json file

    //     const rawdata = fs.readFileSync(uploadpath)
    //     const entity = JSON.parse(rawdata)
    //     console.log("entity ----------------", entity)

    //     if (!validateEntity(entity)) {
    //         P.error = `invalid upload entity@ ${data.filename}`
    //         console.log("error ----------------", P.error)
    //         fs.unlinkSync(uploadpath)
    //     }

    //     // re-preprocess all
    //     if (P.error.length == 0) {
    //         invoke("./preproc", () => {
    //             // re-ingest all
    //             ingestEntity('./data/out', 'entity')
    //             ingestClassLinkage('./data/out/class-link.json', 'class')
    //             ingestEntityPathVal('./data/out/path_val', 'pathval')
    //             ingestCollection('./data/out/collections', 'collection')
    //             ingestCollectionEntities('./data/out/collection-entities.json', 'colentities')
    //         })
    //     }
    
    //     await OnList(entity.Entity, render_ejs)
    // })
}