import requests
import os
from urllib.parse import urlparse


def download_json_file(url):
    response = requests.get(url)
    if response.status_code == 200:
        # Extract the filename from the URL
        parsed_url = urlparse(url)
        path = "D:\\BlockStars\\5 Lions\\"+parsed_url.path
        directory = os.path.dirname(path)
        os.makedirs(directory, exist_ok=True)
        # Save the file with the desired name
        with open(path, 'wb') as file:
            file.write(response.content)
        print(f"Downloaded: {path}")
    else:
        print(f"Failed to download: {url}")


# List of JSON file links
json_links = [
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/game/res/9f365729dbd66974897a98b0751adad4.png?key=d1e08",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/client/game.json?key=d1e08",
    "https://common-static.pragmaticplay.net/gs2c/common/games-html5/games/vs/vs40bigjuan/desktop/client/resources.json?key=d1e08",


    # Add more links as needed
]

# Create a directory to store the downloaded files


# Download each JSON file
for link in json_links:
    download_json_file(link)

print("All files downloaded successfully.")
