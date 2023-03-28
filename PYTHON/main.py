#!/usr/bin/env python
# build: pyinstaller main.py --onefile --icon=img.ico

from genericpath import exists
import requests
import shutil
import os
import signal
import sys
from colorit import init_colorit, background
from PIL import Image
from random import choice

sys.path.append(os.path.realpath('..'))
dir = os.path.dirname(__file__)

def sig_handler(sig, frame):
    sys.exit(0)

signal.signal(signal.SIGINT, sig_handler)

rc = int(choice((1, 2)))
recommended = 100
blockSize = " "
im = 'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false&gif=false'
pics = 'https://api.waifu.pics/sfw/waifu'

# check you know
if len(sys.argv) == 2:
    if sys.argv[1] == '--nsfw=true':
        im = 'https://api.waifu.im/search/?selected_tags=waifu&is_nsfw=true&gif=false'
        pics = 'https://api.waifu.pics/nsfw/waifu'
else:
    pass

# get the API from https://api.waifu.pics/sfw/waifu or https://api.waifu.im/random/?selected_tags=waifu&is_nsfw=false&gif=false
DB = input("Which database, waifu.pics or waifu.im? [1 or 2]: ")

match DB:
    case 1:
        corUrl = requests.get(pics).json()['url']
    case 2:
        corUrl = requests.get(im).json()["images"][0]["url"]
    case _:
        match rc:
            case 1:
                corUrl = requests.get(im).json()["images"][0]["url"]
            case _:
                corUrl = requests.get(pics).json()['url']

# write API data to the img.png file
with open(f'{dir}/img.png', 'wb') as handler:
    handler.write(requests.get(corUrl).content)

# img size
too = input("Pixel width, 1 or 2 spaces? [1 or 2]: ")
match too:
    case 1:
        blockSize = blockSize
        recommended = recommended
    case 2:
        blockSize = "  "
        recommended = 50
    case _:
        too = rc
        blockSize = blockSize * rc
        recommended = recommended / rc


# resizes image so it can fit in the console
basewidth = input(f"Image size [{int(recommended)} is recommended]: ")
if (basewidth == ""):
    basewidth = recommended

img = Image.open(f'{dir}/img.png')
wpercent = (int(basewidth)/float(img.size[0]))
hsize = int((float(img.size[1])*float(wpercent)))
img = img.resize((int(basewidth), hsize), Image.Resampling.LANCZOS)
img.save(f'{dir}/img.png')

# Print Image from api
init_colorit()
image = Image.open(f'{dir}/img.png')
image.resize((int(1), int(1)))
for y in range(image.size[1]):
    for x in range(image.size[0]):
        print(background(blockSize, image.getpixel((x, y))), end='')
    print()

# print link and separator
print(u'\u2500' * int(basewidth) * int(too))
print(f"Sauce [Source]: {corUrl}")

# saving the img
answer = input("Want to save the image? [y/n]: ")
match answer:
    case "y":
        name = input("What is the image file name: ")
        response = requests.get(corUrl, stream=True)
        if not os.path.exists(f'{dir}/saved'):
            os.makedirs(f'{dir}/saved')
            print("Directory /saved/ was created since it wasn't found")
        with open(f'{dir}/saved/{name}.png', 'wb') as out_file:
            shutil.copyfileobj(response.raw, out_file)
        del response
        print("Saved successfully, check the saved folder!")
    case "n":
        input("[Press <ENTER> to exit]")
        os.system('cls||clear')
        os.remove(f'{dir}/img.png')
    case _:
        pass

if exists(f'{dir}/img.png'):
    os.remove(f'{dir}/img.png')
