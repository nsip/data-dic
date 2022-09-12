import * as assert from 'assert'
import { MongoClient, dbName, url } from '../db/shared.js'
import { find_dic } from '../db/db-find.js'

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
    // fastify.get('/api/entity-path/:entity', async (req, res) => {

    //     try {
    //         const client = await MongoClient.connect(url)
    //         const db = client.db(dbName)

    //         let field = req.params.entity
    //         field = field.replaceAll(".", "[dot]")

    //         const cont = await find_dic(db, 'class', true, true, '', null, field)
    //         const navPathCol = []
    //         let code = 200

    //         if (Object.keys(cont).length !== 0) {
    //             const pathCol = cont[field]
    //             if (Array.isArray(pathCol)) {
    //                 for (let path of pathCol) {
    //                     navPathCol.push(path.split('--'))
    //                 }
    //             }
    //         } else {
    //             code = 404
    //         }

    //         res.code(code)
    //             .header('Content-Type', 'application/json; charset=utf-8')
    //             .send(navPathCol)

    //         await client.close()

    //     } catch (err) {
    //         console.log(err)
    //     }
    // })

    fastify.get('/api/entity/:entity', async (req, res) => {

        // console.log('body    ---', req.body)           // from body
        // console.log('query   ---', req.query)          // from url
        // console.log('params  ---', req.params.entity)  // from /url:param
        // console.log('headers ---', req.headers)

        try {

            let code = 200

            const entity = req.params.entity.trim()
            let attr = ''
            let value = ''

            if (entity.length != 0) {
                attr = 'Entity'
                value = entity
            }

            const client = await MongoClient.connect(url)
            const db = client.db(dbName)

            let cont = await find_dic(db, 'entities', false, true, attr, value)
            if (cont.length == 0) {
                cont = await find_dic(db, 'collections', false, true, attr, value)
                if (cont.length == 0) {
                    code = 404
                }
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