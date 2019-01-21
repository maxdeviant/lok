#!/usr/bin/env node

import tree, { Tree } from '../src/tree'
import parse, { Parse } from '../src/parse'
import output from '../src/output'
import config from '../src/config'


interface Result extends Parse {
    files: number
}

const result: {
    [key: string]: Result
} = { }


const merge = (lang: string, { code, comment, blank, lines }: Parse) => {
    if(result[lang] === undefined) {
        result[lang] = {
            code: 0,
            comment: 0,
            blank: 0,
            lines: 0,
            files: 0
        }
    }
    result[lang].code += code
    result[lang].comment += comment
    result[lang].blank += blank
    result[lang].lines += lines
    result[lang].files += 1
}


const getFiles = (fileTree: Tree[]): Tree[] => {
    let files = []
    fileTree.forEach((item) => {
        if(item.type === 'file') {
            config[item.extension] && files.push(item)
        }else {
            files = files.concat(getFiles(item.children))
        }
    })
    return files
}


const files = getFiles(tree(process.cwd(), {
    filter: /node_modules|\.git/
}))


files.forEach((file) => {
    const conf = config[file.extension]
    merge(conf[0], parse(file.path, conf[1]))
})

output(result)


