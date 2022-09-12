'use strict'

import cp from 'child_process'
import process from 'process'
import fs from 'fs'
import path from 'path'

export const invoke = (exePath, done) => {

    const oriDir = process.cwd()
    console.log("\nOriginal directory:", oriDir)

    exePath = path.resolve(exePath)
    const executable = "./" + path.parse(exePath).base;
    const exeDir = path.parse(exePath).dir;

    if (!fs.existsSync(exePath)) {
        console.log(`[${exePath}] is not existing - fatal`)
        process.exit(1)
    }

    process.chdir(exeDir)
    console.log("\nCurrent directory:", exeDir)

    console.log(`\nInvoking: ${executable}`)

    cp.execFile(executable, (err, data) => {
        if (err !== null) {
            console.log("\nINVOKE ERROR")
            console.log(JSON.stringify(err, null, 2))
            process.exit(1)
        } else {
            console.log(data.toString());
            process.chdir(oriDir)
            console.log("\nOK, Back to directory:", oriDir)
            if (done != null) {
                done()
            }
        }
    });
}

// comment this out if not testing
// invoke("../preproc")

export const createIfNeeded = (path) => {
    if (fs.existsSync(path)) {
        return
    }
    fs.mkdirSync(path, { recursive: true })
}

// createIfNeeded("./uploaded")