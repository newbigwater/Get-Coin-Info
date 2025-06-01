import requests

url = "https://api.upbit.com/v1/market/all?is_details=true"

headers = {"accept": "application/json"}

res = requests.get(url, headers=headers)

res.json()

for item in res.json():
    print(item['market'])

