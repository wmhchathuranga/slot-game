import requests
import os
from urllib.parse import urlparse


def download_json_file(url):
    response = requests.get(url)
    if response.status_code == 200:
        # Extract the filename from the URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        # Save the file with the desired name
        with open(filename, 'wb') as file:
            file.write(response.content)
        print(f"Downloaded: {filename}")
    else:
        print(f"Failed to download: {url}")


# List of JSON file links
json_links = [
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_sounds.mp3.json?key=342b40ce692f395284bba72b628a74fe",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/sounds.mp3.json?key=0afbbd415ca57e59051cce5ae33df9b1",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/other_resources002.json?key=ae251a68df397315692aab64b4e6c49f",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/other_resources001.json?key=5c5a485a28d42e7adb1ce73262c2f87d",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/other_resources000.json?key=6c6b301243033fa53e6990896512f429",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources021.json?key=9128481ee84c3b9060458e6d344fe6a0",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources020.json?key=3f924f5e2dff250f9f9fe8f01c2d6320",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources019.json?key=caa5c7bdf88683f18d1bc3a205d3db95",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources018.json?key=ee9fbb34bacb5ed8df2a5c70e261d529",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources017.json?key=9b9d3c490c2f97cd7495f8c5e429fb4f",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources016.json?key=cf17b777707063fde76c009c73fdeada",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources015.json?key=e0b9941d47b17a8742cdebfa873d4595",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources014.json?key=6d49bc891e64e2664a1bd4de57a122d4",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources013.json?key=58f7c2d970ee520e2bfe641fc46920c4",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources012.json?key=20df5fe5db553ce17898fb0dad9e5a9c",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources011.json?key=5358274702b3a2d7e7c9a201f6ae9cb4",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources010.json?key=67d59aca0c913bd44a3fb2590cf37410",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources009.json?key=ad1b9c587940dba364da859610c35094",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources008.json?key=b40d496143b2fe03ff6b7b2e90255d44",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources007.json?key=34704dd380121084640b3d367f1f61a4",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources006.json?key=c58d5973408509cb58451c91cdb91ed2",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources005.json?key=211461a475379fb5e1b3b442b2e11995",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources004.json?key=eb07f2cc98c97ec38501e037adc92d20",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources003.json?key=8fe3727b384f411eddfc88f0648a3353",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources002.json?key=eaa4c1f241637520166872b9142e9de1",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources001.json?key=c9b5cf74b745339c72551f8077b3ef98",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/main_resources000.json?key=a5263f6c4a9507601cbbf4acf1369db4",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/game001.json?key=1327cbcafac5db520eaafe8da404f003",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/game000.json?key=308bf4cac8606c9a48c30398b1071ccd",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_resources004.json?key=02217d3a5f4cc663dcaaf0f7fb570a76",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_resources003.json?key=0e4fd1fc4428dc75304b445deb772730",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_resources005.json?key=41b5f88e197881a5fc616a9e75148d8d",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_resources001.json?key=8355e75c9b04b7fb6234cddba50f245f",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_resources002.json?key=73a43e1980bb6216eb0be7209ccaeb0a",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI_resources000.json?key=1267c37c813e46b8065f123b18c12007",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI006.json?key=3e9f74e0b9f9ddea254c701fe8085de7",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI004.json?key=102c5848485dcae495679b78dba66cf3",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI005.json?key=3f3664b04ccc25b02454d7b251b8ebba",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI003.json?key=6951fdd0ff4d57590860957ccdc83d0f",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI002.json?key=539b5906034a85abab3d4b1caaea3dda",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI001.json?key=a7ea4c9e73e0f17592b5c0aa21d5d64c",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/GUI000.json?key=250dcd6eeabdc54be493d5af7f594a48",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/client/game.json?key=d1e08",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/client/resources.json?key=d1e08",

    # Add more links as needed
]

# Create a directory to store the downloaded files
directory = "gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game"
os.makedirs(directory, exist_ok=True)
os.chdir(directory)

# Download each JSON file
for link in json_links:
    download_json_file(link)

print("All files downloaded successfully.")
