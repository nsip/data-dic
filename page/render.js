import * as ejs from 'ejs'
import * as fs from 'fs'
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

    // click @ local href
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
}