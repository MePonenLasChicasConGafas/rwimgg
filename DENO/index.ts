// deno-lint-ignore-file prefer-const
import { printImage } from "https://x.nest.land/terminal_images@3.0.0/mod.ts";
import { download } from "https://deno.land/x/download@v1.0.1/mod.ts";
import * as Colors from "https://deno.land/std@0.175.0/fmt/colors.ts"

Deno.addSignalListener("SIGINT", () => {
  console.log('[SIGINT] Detected; Aborting program')
})

const isNsfw = Deno.args.find(str => str == "--nsfw")

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

const exists = async (filename: string): Promise<boolean> => {
    try {
      await Deno.stat(filename);
      // successful, file or directory must exist
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // file or directory does not exist
        return false;
      } else {
        // unexpected error, maybe permissions, pass it along
        throw error;
      }
    }
  };

const sample = (arr: Array<string>) => arr[Math.floor(Math.random() * arr.length)];
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const uuidv4 = () => ('' + [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, ch => {return (+ch ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +ch / 4).toString(16);});
const lastOf = (arr: Array<string>) => arr[arr.length - 1];

//fetch image link
const jsonResponse = await fetch(sample(urls));
const data = await jsonResponse.json();

//img link (regardless of source)
const link = data.url ?? data.images[0].url

//filename
let fileExtension = lastOf(link.split('.'))
const fileName = `${uuidv4()}.${fileExtension}`

//term columns
const columns = Deno.consoleSize().columns;

//main function
(async() => {
    if(!await exists('./saved/')){
        Deno.mkdir('saved')
    } //if /saved/ dir does not exist create dir

    await printImage({
        path: link,
        width: columns
    }).then(async ()=>{
        await delay(1)

        console.log(`\u{2500}`.repeat(columns)) //hr
        console.log('[!] Sauce/ Image Link: ' + Colors.blue(link)) //link
        
        const save = confirm(Colors.yellow("[?] Save image?")) //prompt to save image
        
        //if (save == true) download
        save && await download(link, {
            dir: './saved/',
            file: fileName
        }).then(()=>{
            console.log(Colors.green('[✓] File saved successfully in ./saved/ as '+fileName))
        })
    })
})();

//deno run --allow-all index.ts
//https://files.catbox.moe/2ek3gr.ts
