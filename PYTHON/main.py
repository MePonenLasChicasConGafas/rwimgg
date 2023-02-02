#!/usr/bin/env python
# build: pyinstaller main.py --onefile --icon=img.ico

from genericpath import exists
import requests
import shutil
import os
import sys
from colorit import init_colorit, background
from PIL import Image
from random import choice

rc = int(choice((1, 2)))
recommended = 100
blockSize = " "
im = 'https://api.waifu.im/random/?selected_tags=waifu&is_nsfw=false&gif=false'
pics = 'https://api.waifu.pics/sfw/waifu'

# check you know
if len(sys.argv) == 2:
    if sys.argv[1] == '--nsfw=true':
        im = 'https://api.waifu.im/random/?selected_tags=waifu&is_nsfw=true&gif=false'
        pics = 'https://api.waifu.pics/nsfw/waifu'
else:
    pass

# get the API from https://api.waifu.pics/sfw/waifu or https://api.waifu.im/random/?selected_tags=waifu&is_nsfw=false&gif=false
DB = input("Which database, waifu.pics or waifu.im? [1 or 2]: ")

if DB == 1:
    corUrl = requests.get(pics).json()['url']
elif DB == 2:
    corUrl = requests.get(im).json()["images"][0]["url"]
else:
    if rc == 1:
        corUrl = requests.get(im).json()["images"][0]["url"]
    else:
        corUrl = requests.get(pics).json()['url']

# write API data to the img.png file
with open('img.png', 'wb') as handler:
    handler.write(requests.get(corUrl).content)

# img size
too = int(input("Pixel width, 1 or 2 spaces? [1 or 2]: "))
if too == 1:
    blockSize = blockSize
    recommended = recommended
elif too == 2:
    blockSize = "  "
    recommended = 50
else:
    too = rc
    blockSize = blockSize * rc
    recommended = recommended / rc


# resizes image so it can fit in the console
basewidth = int(input(f"Image size [{recommended} is recommended]: "))

img = Image.open('img.png')
wpercent = (basewidth/float(img.size[0]))
hsize = int((float(img.size[1])*float(wpercent)))
img = img.resize((basewidth, hsize), Image.Resampling.LANCZOS)
img.save('img.png')

# Print Image from api
init_colorit()
image = Image.open('img.png')
image.resize((int(1), int(1)))
for y in range(image.size[1]):
    for x in range(image.size[0]):
        print(background(blockSize, image.getpixel((x, y))), end='')
    print()

# print link and separator
print(u'\u2500' * basewidth * too)
print(f"Sauce [Source]: {corUrl}")

# saving the img
answer = input("Want to save the image? [y/n]: ")
if answer == "y":
    name = input("What is the image file name: ")
    response = requests.get(corUrl, stream=True)
    if not os.path.exists('saved'):
        os.makedirs('saved')
        print("Directory /saved/ was created since it wasn't found")
    with open(f'saved/{name}.png', 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    del response
    print("Saved successfully, check the saved folder!")
elif answer == "n":
    input("[Press <ENTER> to exit]")
    os.system('cls||clear')
    os.remove("img.png")
else:
    pass

if exists('img.png'):
    os.remove("img.png")
