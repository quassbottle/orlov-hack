import json
from config.model import Config
from confluent_kafka import Producer
import uuid
from kafka.messages.model import Message

class MessagesProducer:
    __config: Config
    __producer: Producer
    __topic: str

    def __init__(self, config: Config):
        self.__config = config
        self.__topic = self.__config.click_kafka_topic
        self.__producer = self.__create_kafka_producer()

    def push_message(self, message: Message):
        self.__produce_message(message)

    def __create_kafka_producer(self) -> Producer:
        return Producer(self.__get_kafka_config())

    def __get_kafka_config(self):
        return {
            'bootstrap.servers': self.__config.kafka_brokers[0],  
            'client.id': self.__config.kafka_producer_client_id
        }
    
    def __produce_message(self, payload):
        self.__producer.produce(
            topic=self.__topic,
            key=uuid.uuid4().__str__(),
            value=self.__prepare_payload(payload),
            callback=self.__produce_callback
        )

    def __prepare_payload(self, payload: Message):
        try:
            return json.dumps(payload.to_dict()).encode('utf-8')
        except:
            return payload
        
    def __produce_callback(err, msg):
        if err is not None:
            print(f"Ошибка доставки сообщения: {err}")