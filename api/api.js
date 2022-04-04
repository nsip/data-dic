import * as assert from 'assert'
import { MongoClient, dbName, url, find_dic } from '../db/db-find.js'

export const dic_api = async (fastify, options) => {

    fastify.get('/hello-world', async (req, res) => {
        const hw = {
            msg: 'hello world @ ' + new Date().getTime(),
        }
        res.code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send(hw)
    })

    fastify.get('/api/entity/:entity', async (req, res) => {

        // console.log('body    ---', req.body)           // from body
        // console.log('query   ---', req.query)          // from url
        // console.log('params  ---', req.params.entity)  // from /url:param
        // console.log('headers ---', req.headers)

        MongoClient.connect(url, async (err, client) => {
            assert.equal(null, err)
            console.log("Connected successfully to server")

            const db = client.db(dbName) // create if not existing
            const colName = 'entity'

            const cont = await find_dic(db, colName, true, 'Entity', req.params.entity)
            let code = 200
            if (cont == null) {
                code = 404
            }

            res.code(code)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(cont)

            await client.close()
        })
    })

    fastify.get('/api/identifier/:identifier', async (req, res) => {

        MongoClient.connect(url, async (err, client) => {
            assert.equal(null, err)
            console.log("Connected successfully to server")

            const db = client.db(dbName) // create if not existing
            const colName = 'entity'

            const cont = await find_dic(db, colName, true, 'Identifier', req.params.identifier)
            let code = 200
            if (cont == null) {
                code = 404
            }

            res.code(code)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(cont)

            await client.close()
        })
    })

}