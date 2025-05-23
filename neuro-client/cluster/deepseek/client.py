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
        if len(text) <= 25:
            print('message is a short:', text)
            return False
        
        response = requests.post(
            f'{self.__config.deep_seek_url}/chat', 
            headers=self.__get_base_headers(),
            json=self.__get_deep_seek_payload(self.__get_deep_seek_is_accident_message(text))
        )


        print(response, response.text, f'{self.__config.deep_seek_url}/chat')

        if response.status_code != 200:
            raise BadRequestException 

        percent = response.json()['response']
        true_percent = re.sub(r"[^\d]", "", percent)

        print(f'[{true_percent}]: {text}')

        return int(true_percent) >= 60

    def get_accident_info(self, text: str) -> AccidentInfo:
        response = requests.post(
            f'{self.__config.deep_seek_url}/chat',
            headers=self.__get_base_headers(),
            json=self.__get_deep_seek_payload(self.__get_deep_seek_accident_info(text))
        )

        print(response, response.text)
        
        if response.status_code != 200:
            raise BadRequestException 

        content = response.json()['response']
        content = content.replace('```json', '').replace('```', '')


        return AccidentInfo(**json.loads(content))

    def __get_base_headers(self):
        return {
            "Authorization": self.__config.deep_seek_token,
            "Content-Type": "application/json",
        }
    
    def __get_deep_seek_payload(self, message: str):
        return {
           "prompt": message 
        }
    
    def __get_deep_seek_is_accident_message(self, original_message: str) -> str:
        return f'''
            Определи, является ли предложение "{original_message}" жалобой или обращением, связанным с транспортной инфраструктурой или логистикой. Критерии:  
            - Проблемы с дорогами (ямы, разметка, освещение и т. д.)  
            - Работа светофоров (долгие циклы, неисправности)  
            - Дорожные пробки, перекрытия, ремонты  
            - Организация движения (знаки, развязки, парковки)  
            - Общественный транспорт (маршруты, расписания)  
            - Грузовые перевозки, логистические проблемы
            - Иные жалобы или предложения связанные с улучшением городской среды  

            Если тема не относится к перечисленному — 0%.  
            Если относится — укажи процент релевантности (от 1% до 100%), учитывая явность жалобы/обращения.  
            
            Ответ только числом, без пояснений.
        '''
    def __get_deep_seek_accident_info(self, original_message: str) -> str:
        return f'Давай из этого предложения: "{original_message}", ты выделишь дату, время, локацию, и основную суть очень коротко отвечай ТОЛЬКО в формате json, без лишних слов, вот тебе модель ответа {{location,datetime,info}}, datetime в формате yyyy-MM-ddThh:mm:ss'
