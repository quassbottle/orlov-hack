import json
import requests

import re

from cluster.deepseek.model import AccidentInfo
from config.model import Config
from cluster.deepseek.exception import BadRequestException

class DeepSeekClient:
    __config: Config
    def __init__(self, cfg: Config):
        self.__config = cfg

    def is_accident(self, text: str):
        response = requests.post(
            self.__config.deep_seek_url, 
            headers=self.__get_base_headers(),
            json=self.__get_deep_seek_payload(self.__get_deep_seek_is_accident_message(text))
        )

        print(response, response.text)
        if response.status_code != 200:
            raise BadRequestException 

        percent = response.json()['choices'][0]['message']['content']
        true_percent = re.sub(r"[^\d]", "", percent)

        return int(true_percent) >= 70

    def get_accident_info(self, text: str) -> AccidentInfo:
        response = requests.post(
            self.__config.deep_seek_url,
            headers=self.__get_base_headers(),
            json=self.__get_deep_seek_payload(self.__get_deep_seek_accident_info(text))
        )

        print(response, response.text)
        if response.status_code != 200:
            raise BadRequestException 

        content = response.json()['choices'][0]['message']['content']
        content = content.replace('```json', '').replace('```', '')

        return AccidentInfo(**json.loads(content))

    def __get_base_headers(self):
        return {
            "Authorization": self.__config.deep_seek_token,
            "Content-Type": "application/json",
        }
    
    def __get_deep_seek_payload(self, message: str):
        return {
            "messages": [{
                "role": "user",
                "content": message
            }],
            "model": "deepseek/deepseek-v3-turbo",
            "stream": False
        }
    
    def __get_deep_seek_is_accident_message(self, original_message: str) -> str:
        return f'Является ли предложение: "{original_message}" дорожным проишествием, напиши процент того, что оно относится к нему, только процент, без лишнего текста'
    
    def __get_deep_seek_accident_info(self, original_message: str) -> str:
        return f'Давай из этого предложения: "{original_message}", ты выделишь дату, время, локацию, и основную суть очень коротко отвечай ТОЛЬКО в формате json, без лишних слов, вот тебе модель ответа {{location,datetime,info}}, datetime в формате yyyy-MM-ddThh:mm:ss'
