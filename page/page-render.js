import * as ejs from 'ejs'
import * as fs from 'fs'
import { PO, OnFindEntity, OnListEntity } from './db-find.js'

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
    })

    PO.res
        .code(code)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(data)
}

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
        // console.log(new Date().getTime())
        const entityVal = req.body.content // input(text)-name@'content'
        {
            PO.res = res
        }
        await OnFindEntity(
            entityVal.trim(),
            render_ejs,
        )
    })
}