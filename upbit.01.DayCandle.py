# install requests
# python -m pip install requests

import requests
import datetime
import json
import os

# KRW-BTC 마켓에 현재 시각 이전 일봉 100개를 요청
url = "https://api.upbit.com/v1/candles/days"
now = datetime.datetime.utcnow()
now_str = now.strftime('%Y-%m-%d %H:%M:%S')
date_str = now.strftime('%Y-%m-%d')  # 날짜만 사용
params = {  
    'market': 'KRW-BTC',  
    'count': 100,
    'to': now_str
}  
headers = {"accept": "application/json"}

# artifact 폴더 생성
if not os.path.exists('artifact'):
    os.makedirs('artifact')

# 날짜 폴더 생성
date_folder = date_str
date_path = os.path.join('artifact', date_folder)
if not os.path.exists(date_path):
    os.makedirs(date_path)

# 저장할 파일명 생성 (marketName_date.json)
file_name = f"{params['market']}_{date_str.replace('-', '')}.json"
file_path = os.path.join(date_path, file_name)

# 파일이 이미 존재하는지 확인
if os.path.exists(file_path):
    print(f"파일 {file_path}이(가) 이미 존재합니다. 기존 파일을 사용합니다.")
else:
    # API 요청 및 데이터 저장
    response = requests.get(url, params=params, headers=headers)
    
    # 응답 데이터를 JSON 형식으로 파싱
    data = response.json()
    
    # JSON 파일로 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"응답 데이터가 {file_path} 파일로 저장되었습니다.")
    print(f"총 {len(data)}개의 캔들 데이터를 받았습니다.")