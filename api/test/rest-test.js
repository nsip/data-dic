
import { getFileContent } from '../tool.js'
import * as ejs from 'ejs'
import * as fs from 'fs'

export const helloworld = async (fastify, options) => {

    fastify.post('/:id', async (req, res) => {
        console.log('body    ---', req.body)    // from body
        console.log('query   ---', req.query)   // from url
        console.log('params  ---', req.params)  // from /url/:param
        console.log('headers ---', req.headers)
        // console.log('raw     ---', req.raw)
        // console.log('---', req.server)
        // console.log('---', req.id)
        // console.log('---', req.ip)
        // console.log('---', req.ips)
        // console.log('---', req.hostname)
        // console.log('---', req.protocol)
        // console.log('---', req.url)
        // console.log('---', req.routerMethod)
        // console.log('---', req.routerPath)
        // return { hello: 'post1-test' }

        res.send(req.body)
    })

    fastify.get('/index', async (req, res) => {
        const data = await getFileContent('./www/index.html')
        res
            .code(200)
            .header('Content-Type', 'text/html; charset=utf-8')
            .send(data)
        // return data
        // return { hello: 'world ' + new Date().getTime() }
    })

    fastify.get('/ejs', async (req, res) => {
        const template = await getFileContent('./www/hello.ejs')
        const data = ejs.render(template, {
            title: 'hello ejs',
            content: '<strong>big hello ejs.</strong>'
        })
        res
            .code(200)
            .header('Content-Type', 'text/html; charset=utf-8')
            .send(data)
    })
}

//////////////////////////////////////////////////////////////

const template = fs.readFileSync('./www/forum.ejs', 'utf-8')
const posts = []

const showform = (res, myposts) => {
    const data = ejs.render(template, {
        title: 'forum ejs',
        posts: myposts,
    })
    res
        .code(200)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(data)
}

export const forum_test = async (fastify, options) => {

    fastify.get('/forum', async (req, res) => {
        console.log(posts)
        showform(res, posts)
    })

    fastify.post('/submit', async (req, res) => {
        console.log(new Date().getTime())
        posts.push(req.body.content) // input(text)-name@'content'
        showform(res, posts)
    })
}