import * as assert from 'assert'
import { MongoClient, dbName, url, find_dic } from '../db/db-find.js'

export const dic_api = async (fastify, options) => {

    fastify.get('/api/hello-world', async (req, res) => {
        const hw = {
            msg: 'hello world @ ' + new Date().getTime(),
        }
        res.code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send(hw)
    })

    // could be multiple paths
    fastify.get('/api/entity-path/:entity', async (req, res) => {

        try {
            const client = await MongoClient.connect(url)
            const db = client.db(dbName)

            let field = req.params.entity
            field = field.replaceAll(".", "[dot]")

            const cont = await find_dic(db, 'class', true, true, '', null, field)
            const navPathCol = []
            let code = 200

            if (Object.keys(cont).length !== 0) {
                const pathCol = cont[field]
                if (Array.isArray(pathCol)) {
                    for (let path of pathCol) {
                        navPathCol.push(path.split('--'))
                    }
                }
            } else {
                code = 404
            }

            res.code(code)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(navPathCol)

            await client.close()

        } catch (err) {
            console.log(err)
        }
    })

    fastify.get('/api/entity/:entity', async (req, res) => {

        // console.log('body    ---', req.body)           // from body
        // console.log('query   ---', req.query)          // from url
        // console.log('params  ---', req.params.entity)  // from /url:param
        // console.log('headers ---', req.headers)

        try {

            const entity = req.params.entity.trim()

            let attr = ''
            let value = ''

            if (entity.length != 0) {
                attr = 'Entity'
                value = entity
            }

            const client = await MongoClient.connect(url)
            const db = client.db(dbName)

            const cont = await find_dic(db, 'entity', false, true, attr, value)
            let code = 200
            if (cont == null) {
                code = 404
            }

            res.code(code)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(cont)

            await client.close()

        } catch (err) {
            console.log(err)
        }
    })

    fastify.get('/api/identifier/:identifier', async (req, res) => {

        try {

            const id = req.params.identifier.trim()

            let attr = ''
            let value = ''

            if (id.length != 0) {
                attr = 'Metadata.Identifier'
                value = id
            }

            const client = await MongoClient.connect(url)
            const db = client.db(dbName)

            const cont = await find_dic(db, 'entity', true, true, attr, value)
            let code = 200
            if (cont == null) {
                code = 404
            }

            res.code(code)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(cont)

            await client.close()

        } catch (err) {
            console.log(err)
        }
    })
}