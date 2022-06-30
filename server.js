import path from 'path'
import { fileURLToPath } from 'url';
import fastifyFac from 'fastify'
import multipart from '@fastify/multipart'
import formbody from '@fastify/formbody'
import stat from '@fastify/static'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'

import { config } from './config.js'
import { esa_dic } from './page/render.js'
import { dic_api } from './api/api.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(__filename)
// console.log(__dirname)

// --- init fastify --- //
const fastify = fastifyFac({ logger: false })
fastify.register(multipart)
fastify.register(formbody)
fastify.register(cors)

// --- register api --- //
fastify.register(dic_api)

// --- register page api --- //
fastify.register(esa_dic)
fastify.register(stat, {
    root: path.join(__dirname, 'www'),
    prefix: '/', // optional: default '/'
})

// --- run the server --- //
const start = async () => {
    try {
        await fastify.listen(
            {
                port: config.port,
                host: config.host,
            }
        )
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()