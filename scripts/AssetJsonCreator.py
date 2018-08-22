import os
import json

data = {}


scriptPath = os.path.dirname(os.path.abspath(__file__)).replace("/", " ").split()

assetsPath =  "/" + "/".join(scriptPath[:-1]) + "/assets"

for assetType in os.listdir(assetsPath):
	if assetType == "character":
		for characterSpriteSheet in os.listdir(assetsPath + "/character"):
			if not characterSpriteSheet.startswith("."):
				data[characterSpriteSheet] = { "files": [] }
				
				for image in os.listdir(assetsPath + "/character/" + characterSpriteSheet + "/default/0"):
					
					loadData = {
					"type": "image",
					"key": characterSpriteSheet + "_" + image.replace(".png", ""),
					"url": "assets/character/" + characterSpriteSheet + "/default/0/" + image
					}

					data[characterSpriteSheet]["files"].append(loadData)

json_data = json.dumps(data)


with open('data.json', 'w') as outfile:
    json.dump(data, outfile)


animationData = {
	"anims" = [],
	"globalTimeScale" : 1
}

lastFrame = {}

for assetType in os.listdir(assetsPath):
	if assetType == "character":
		for characterSpriteSheet in os.listdir(assetsPath + "/character"):
			if not characterSpriteSheet.startswith("."):
				for image in os.listdir(assetsPath + "/character/" + characterSpriteSheet + "/default/0"):

					print characterSpriteSheet + "_" + image.replace(".png", "")