#!/usr/bin/env -S deno run --allow-all
// deno-lint-ignore-file prefer-const no-explicit-any
import { printImage } from "https://x.nest.land/terminal_images@3.0.0/mod.ts"
import { download } from "https://deno.land/x/download@v1.0.1/mod.ts"
import * as Colors from "https://deno.land/std@0.175.0/fmt/colors.ts"
import { trytm } from "./trytm.ts";

Deno.addSignalListener("SIGINT", () => {
	console.log("[SIGINT] Detected; Aborting program")
})

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
		// successful, file or directory must exist
		return true
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			// file or directory does not exist
			return false
		} else {
			// unexpected error, maybe permissions, pass it along
			throw error
		}
	}
}

const sample = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const lastOf = (arr: any[]) => arr[arr.length - 1]

//fetch json, if err throw err
const [JSONResponse, err] = await trytm(fetch(sample(urls)))
if (err) throw Error('Couldn\'t fetch image')

//extract json data
const JSONData = await (JSONResponse).json()

//img link (regardless of source)
const link = JSONData.url ?? JSONData.images[0].url

//filename
let fileExtension = lastOf(link.split("."))
const fileName = `${crypto.randomUUID()}.${fileExtension}`

//term columns
const columns = Deno.consoleSize().columns

//main function
;(async () => {
	//if /saved/ dir does not exist create dir
	if (!await exists("./saved/")) Deno.mkdir("saved")

	await printImage({
		path: link,
		width: columns,
	}).then(async () => {
		await delay(1)

		console.log(`\u{2500}`.repeat(columns)) //<hr>
		console.log(`[!] Sauce/Image Link: ${Colors.blue(link)}`) //link

		const save = confirm(Colors.yellow("[?] Save image?")) //prompt to save image

		//if (save == true) download
		if (save) {
			const [_success, err] = await trytm(download(link, {
				dir: "./saved/",
				file: fileName
			}))

			if (!err) console.log(Colors.green(`[✓] File saved successfully in ./saved/ as ${fileName}`))
			else throw Error(`Couldn\'t download image [${link}].`)
		}
	})
})()

//deno run --allow-all mod.ts
//deno fmt