'use strict'

import ejs from 'ejs'
import fs from 'fs'
import fsp from 'fs/promises'
import util from 'util'
import { createIfNeeded, invoke } from './tool.js'
import { validateEntity } from './validate.js'
import { ingestEntity, ingestClassLinkage } from '../db/db-ingest.js'
import { pipeline } from 'stream'
const pump = util.promisify(pipeline)

import { P, InitP, OnListEntity, OnFindEntity } from '../db/db-find.js'

// running work dir for 'ejs'
const template = fs.readFileSync('./www/dictionary.ejs', 'utf-8')

const render_ejs = (P, code) => {

    const data = ejs.render(template, {
        title: P.title,
        entities: P.entities,
        content: P.content,
        entity: P.entity,
        collections: P.collections,
        crossrefEntities: P.crossrefEntities,
        definition: P.definition,
        expectedAttributes: P.expectedAttributes,
        identifier: P.identifier,
        legalDefinitions: P.legalDefinitions,
        otherNames: P.otherNames,
        otherStandards: P.otherStandards,
        sif: P.sif,
        superclass: P.superclass,
        type: P.type,
        defParent: P.defParent,
        error: P.error,
        search_value: SearchVal,
        navPathCol: P.navPathCol,
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

    // init page
    fastify.get('/', async (req, res) => {

        // console.log('query   ---', req.query.entity)

        console.log("\n-------------------------------------INIT-------------------------------------")

        SearchVal = ''

        if ('entity' in req.query) {
            SearchVal = req.query.entity.trim()
        }

        if (SearchVal.length == 0) {

            InitP()
            P.res = res

            await OnListEntity(render_ejs)

        } else {

            P.error = ''
            P.res = res

            await OnFindEntity(SearchVal, render_ejs)
        }
    })

    // click @ local url href for 'School', 'Campus'
    for (const entity of ['School', 'Campus']) {
        fastify.get(`/${entity}`, async (req, res) => {

            console.log("\n-------------------------------------CLICK URL-------------------------------------")

            P.error = ''
            P.res = res

            SearchVal = entity

            await OnFindEntity(
                SearchVal.trim(),
                render_ejs,
            )
        })
    }

    // if [entity] is empty, input(text) applies on form submit
    fastify.post(`/:entity`, async (req, res) => {

        console.log("\n------------------------------------- POST SEARCH -------------------------------------")

        P.error = ''
        P.res = res

        SearchVal = req.params.entity

        if (SearchVal.length == 0) {
            SearchVal = getValue(req.body.entity) // input(text)-name@'entity' ref. dictionary.ejs ln77
        }

        await OnFindEntity(
            SearchVal.trim(),
            render_ejs,
        )
    })

    fastify.post('/new', async (req, res) => {

        console.log("\n-------------------------------------NEW ENTITY-------------------------------------\n")

        P.error = ''
        P.res = res

        const filename = req.body.Entity
        createIfNeeded('./data')
        const uploadpath = `data/${filename}.json`

        fs.writeFile(uploadpath, JSON.stringify(req.body), (err) => {
            if (err) {
                console.log("-------------------", err)
            }
        })

        // waiting for file saving is finished !
        while (!fs.existsSync(uploadpath)) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (fs.existsSync(uploadpath)) {
            await fsp.readFile(uploadpath, { encoding: 'utf8' })
        }

        // re-preprocess all
        invoke("./data/preproc/preproc", () => {
            // re-ingest all
            ingestEntity('./data/preproc/out', 'entity')
            ingestClassLinkage('./data/preproc/out/class-link.json', 'class')
        })

        ///////////////////////////////////////////////////////////////////////

        await OnListEntity(render_ejs)

    })

    // add Entity from JSON file, form with [enctype="multipart/form-data"] on submit
    fastify.post('/add', async (req, res) => {

        console.log("\n-------------------------------------ADD ENTITY-------------------------------------\n")

        P.error = ''
        P.res = res

        // process a single file, also, consider that if you allow to upload multiple files
        // consume all files otherwise the promise will never fulfill
        const data = await req.file()

        // data.file // stream
        // data.fields // other parsed parts
        // data.fieldname
        // data.filename
        // data.encoding
        // data.mimetype
        // await data.toBuffer() // Buffer

        createIfNeeded('./data')
        const uploadpath = `data/${data.filename}`
        await pump(data.file, fs.createWriteStream(uploadpath))

        // be careful of permission issues on disk and not overwrite, sensitive files that could cause security risks
        // also, consider that if the file stream is not consumed, the promise will never fulfill

        ///////////////////////////////////////////////////////////////////////
        // validate inbound entity json file

        const rawdata = fs.readFileSync(uploadpath)
        const entity = JSON.parse(rawdata)
        console.log("entity ----------------", entity)

        if (!validateEntity(entity)) {
            P.error = `invalid upload entity@ ${data.filename}`
            console.log("error ----------------", P.error)
            fs.unlinkSync(uploadpath)
        }

        // re-preprocess all
        if (P.error.length == 0) {
            invoke("./data/preproc/preproc", () => {
                // re-ingest all
                ingestEntity('./data/preproc/out', 'entity')
                ingestClassLinkage('./data/preproc/out/class-link.json', 'class')
            })
        }

        ///////////////////////////////////////////////////////////////////////

        await OnListEntity(render_ejs)

    })
}