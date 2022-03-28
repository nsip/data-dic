import * as ejs from 'ejs'
import * as fs from 'fs'
import { PO, OnListEntity, OnFindEntity } from '../db/db-find.js'

// running work dir for 'ejs'
const template = fs.readFileSync('./www/dictionary.ejs', 'utf-8')

const render_ejs = (PO, code) => {

    const data = ejs.render(template, {
        title: PO.title,
        entities: PO.entities,
        content: PO.content,

        entity: PO.entity,
        collections: PO.collections,
        crossrefEntities: PO.crossrefEntities,
        definition: PO.definition,
        expectedAttributes: PO.expectedAttributes,
        identifier: PO.identifier,
        legalDefinitions: PO.legalDefinitions,
        otherNames: PO.otherNames,
        otherStandards: PO.otherStandards,
        sif: PO.sif,
        superclass: PO.superclass,
        type: PO.type,

        search_value: SearchVal,
    })

    PO.res
        .code(code)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(data)
}

let SearchVal = ''

export const esa_dic = async (fastify, options) => {

    fastify.get('/', async (req, res) => {
        {
            PO.res = res
        }
        await OnListEntity(
            render_ejs
        )
    })

    fastify.post('/search', async (req, res) => {

        SearchVal = req.body.content // input(text)-name@'content'

        {
            PO.res = res
        }

        await OnFindEntity(
            SearchVal.trim(),
            render_ejs,
        )
    })
}