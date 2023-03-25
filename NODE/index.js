import terminalImage from 'terminal-image'
import chalk from 'chalk';

import readline from 'node:readline';
import fs from 'node:fs'
import https from 'node:https'
import crypto from 'node:crypto'

const log = console.log

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).on("SIGINT", () => {
    process.emit("SIGINT");
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)];
const isNsfw = Boolean(process.argv.find(string => string == '--nsfw'))
const uuidv4 = () => ('' + [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, ch => {return (+ch ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +ch / 4).toString(16);});
const lastOf = arr => arr[arr.length - 1];

const urls = (isNsfw ? [ //if true get nsfw
    "https://api.waifu.pics/nsfw/waifu",
    "https://api.waifu.pics/nsfw/neko",
    "https://api.waifu.im/search/?included_tags=hentai&gif=false&is_nsfw=true"
] : [ //if false use sfw
    'https://api.waifu.pics/sfw/waifu',
    'https://api.waifu.pics/sfw/neko',
    'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false',
    'https://api.waifu.im/search/?included_tags=oppai&is_nsfw=false'
])

async function main() {
    if (!fs.existsSync('saved')) {
        fs.mkdirSync('saved')
    }

    const data = await fetch(sample(urls)).then(res => res.json())
    const link = data.url ?? data.images[0].url
    const filename = `${uuidv4()}.${lastOf(link.split('.'))}`

    const image = await terminalImage.buffer(link,{
        width: '100%',
        preserveAspectRatio: true
    })
    
    log(image)
    log(`\u{2500}`.repeat(process.stdout.columns)) //hr
    log('[!] Sauce/ Image Link: ' + chalk.blue(link)) //link

    rl.question(chalk.yellow('[?] Save image? [y/N] '), input => {
        if (input == 'y'??'Y') {
            https.get(link, resp => resp.pipe(fs.createWriteStream(`./saved/${filename}`)));
            log(chalk.green('[✓] File saved successfully in ./saved/ as '+filename))
        
        } else if (input == 'n'??'N') {
            rl.close()
        } else {
            log('Strange input; exited')
            process.exit()
        }
        
        rl.close()
    })
}

main()