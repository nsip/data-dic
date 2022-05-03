import cp from 'child_process'
import process from 'process'

export const invoke = (exePath) => {    
    console.log("Current directory:", process.cwd());
    console.log(`invoking: ${exePath}`);

    const exec = cp.execFile
    exec(exePath, (err, data) => {
        if (err !== null) {
            console.log(err)
        }
        console.log(data.toString());
    });
}

// process.chdir("../data/preproc/")
// invoke("./preproc")