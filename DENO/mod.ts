#!/usr/bin/env -S deno run --allow-all
// deno-lint-ignore-file prefer-const no-explicit-any
import { printImage } from "https://x.nest.land/terminal_images@3.0.0/mod.ts"
import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
import * as Colors from "https://deno.land/std@0.175.0/fmt/colors.ts"
import { trytm } from "./trytm.ts";

const log = console.log
const sample = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

Deno.addSignalListener("SIGINT", () => log("[SIGINT] Detected; Aborting program"))

const isNsfw = !!Deno.args.find((str) => str == "--nsfw")

const urls = (isNsfw
	? [ //if true get nsfw
		"https://api.waifu.pics/nsfw/waifu",
		"https://api.waifu.pics/nsfw/neko",
		"https://api.waifu.im/search/?included_tags=hentai&gif=false&is_nsfw=true",
	]
	: [ //if false use sfw
		"https://api.waifu.pics/sfw/waifu",
		"https://api.waifu.pics/sfw/neko",
		"https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false",
		"https://api.waifu.im/search/?included_tags=oppai&is_nsfw=false",
	])

// stolen from [https://stackoverflow.com/a/61868755]
const exists = async (filename: string): Promise<boolean> => {
	try {
		await Deno.stat(filename)
		return true
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return false
		} else {throw error}
	}
}

//fetch json, if err throw err
let rndURL = sample(urls)
const [JSONResponse, err] = await trytm(fetch(rndURL))
if (err) throw Error('Couldn\'t fetch image')

//extract json data and declare img link
const JSONData = await (JSONResponse).json()
const link = JSONData.url ?? JSONData.images[0].url

//filename
let ext = link.split(".").at(-1)
const fileName = `${crypto.randomUUID()}.${ext}`

//term columns
const {columns} = Deno.consoleSize()

//==MAIN FUNC===================================================================
;(async () => {
	//if /saved/ dir does not exist create dir
	if (!await exists("./saved/")) Deno.mkdir("saved")

	await printImage({
		path: link,
		width: columns,
	}).then(async () => {
		await delay(1)

		log(`\u{2500}`.repeat(columns)) //<hr>
		log(`[!] Sauce/Image Link: ${Colors.blue(link)}`) //link

		const save = confirm(Colors.yellow("[?] Save image?")) //prompt to save image

		//if (save == true) download
		if (save) {
			const [_success, err] = await trytm(download(link, {
				dir: "./saved/",
				file: fileName
			}))

			if (!err) log(Colors.green(`[✓] File saved successfully in /saved/ as ${fileName}`))
			else throw Error(`Couldn\'t download image [${link}].`)
		}
	})
})()

//deno run --allow-all mod.ts
//deno fmt