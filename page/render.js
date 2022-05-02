import ejs from 'ejs'
import fs from 'fs'
import util from 'util'
import path from 'path'
import { pipeline } from 'stream'
const pump = util.promisify(pipeline)

import { P, OnListEntity, OnFindEntity } from '../db/db-find.js'

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

export const esa_dic = async (fastify, options) => {

    // init page
    fastify.get('/', async (req, res) => {

        P.res = res

        await OnListEntity(
            render_ejs
        )
    })

    // search @ text input
    fastify.post('/search', async (req, res) => {

        SearchVal = req.body.content // input(text)-name@'content'

        P.res = res

        await OnFindEntity(
            SearchVal.trim(),
            render_ejs,
        )
    })

    // click @ local href for 'School', 'Campus'
    for (const entity of ['School', 'Campus']) {
        fastify.get(`/${entity}`, async (req, res) => {

            SearchVal = entity

            P.res = res

            await OnFindEntity(
                SearchVal.trim(),
                render_ejs,
            )
        })
    }

    // add Entity from JSON file, form with [enctype="multipart/form-data"] on submit
    fastify.post('/add', async (req, res) => {

        // process a single file
        // also, consider that if you allow to upload multiple files
        // you must consume all files otherwise the promise will never fulfill
        const data = await req.file()

        // data.file // stream
        // data.fields // other parsed parts
        // data.fieldname
        // data.filename
        // data.encoding
        // data.mimetype

        // to accumulate the file in memory! Be careful!
        //
        // await data.toBuffer() // Buffer
        //
        // or

        await pump(data.file, fs.createWriteStream(`uploads/${data.filename}`))

        // be careful of permission issues on disk and not overwrite
        // sensitive files that could cause security risks

        // also, consider that if the file stream is not consumed, the promise will never fulfill

        res.code(200).send('SUCCESS')
    })
}