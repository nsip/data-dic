'use strict'

import cp from 'child_process'
import process from 'process'
import fs from 'fs'
import path from 'path'

export const invoke = (exePath, done) => {

    const executable = "./" + path.parse(exePath).base;
    const exeDir = path.parse(exePath).dir;

    if (!fs.existsSync(exePath)) {
        console.log(`[${exePath}] is not existing - fatal`)
        process.exit(1)
    }

    const oriDir = process.cwd()
    console.log("\nOriginal directory:", oriDir);

    process.chdir(exeDir)
    console.log("\nCurrent directory:", exeDir);

    console.log(`invoking: ${executable}`);
    cp.execFile(executable, (err, data) => {
        if (err !== null) {
            console.log("INVOKE ERROR")
            console.log(JSON.stringify(err, null, 2))
            process.exit(1)
        }
        console.log(data.toString());

        process.chdir(oriDir)
        console.log("\nBack to directory:", oriDir);

        if (done != null) {
            done()
        }
    });
}

// invoke("../data/preproc/preproc")

export const createIfNeeded = (path) => {
    if (fs.existsSync(path)) {
        return
    }
    fs.mkdirSync(path, { recursive: true })
}

// createIfNeeded("./uploaded")