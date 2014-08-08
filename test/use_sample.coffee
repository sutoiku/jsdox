# Currently support one file only

exec = require('child_process').exec
write = require('fs').writeFile
basename = require('path').basename

sourceFile = 'path/to/jsFile'
explainDir = 'path/to/explainOutputDir'
saveDir = 'path/to/saveDir'

console.log process.argv

exec 'jsdoc -X ' + sourceFile, {maxBuffer: 400*1024}, (err, stdout, stderr) ->
    if err or stderr
        console.log err.message, stderr
        return
    explainFile = explainDir + '/' + basename(sourceFile)
    write explainFile, stdout, (err3) ->
        if err3
            console.log err3
            return
        exec 'jsdox2 ' + explainFile + ' -o ' + saveDir, (err2, stdout2, stderr2) ->
            if err2 or stderr2
                console.log err2.message, stderr2
                return
            console.log stdout2
            return
        return
    return