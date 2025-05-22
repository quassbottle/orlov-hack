import datetime
import json
from config.model import Config
from confluent_kafka import Consumer

from kafka.messages.model import Message, RawMessage
from kafka.messages.producer import MessagesProducer
from service.analyzer.model import FullParseData
from service.analyzer.service import AnalyzerService
from cluster.deepseek.exception import BadRequestException


class MessagesConsumer:
    __config: Config
    __consumer: Consumer
    __analyzer_service: AnalyzerService
    __message_producer: MessagesProducer
    
    def __init__(self, cfg: Config, service: AnalyzerService, message_producer: MessagesProducer):
        self.__config = cfg
        self.__analyzer_service = service
        self.__message_producer = message_producer
        self.__create_consumer()

    def consume_messages(self):
        try:
            while True:
                msg = self.__consumer.poll(self.__config.kafka_poll) 

                if msg is None or msg == None:
                    continue
                if msg.error():
                    print(f'Exception on kafka message: {msg.error()}')

                try:
                    message_value = msg.value()
                
                    if message_value == None:
                        print('message value is none')
                        continue
                
                    try:
                        raw_message = self.__parse_raw_message(message_value.decode('utf-8'))
                    except Exception as err:
                        print(f'Невалдиное сообщение: {message_value}, err: {err}')
                    
                        self.__consumer.commit()
                    
                        continue
                
                    accident_info = self.__analyzer_service.parse_data(raw_message.text)

                    if not accident_info.is_accident:
                        self.__consumer.commit()
                        continue
                
                    self.__message_producer.push_message(self.__get_click_message(raw_message, accident_info))
                    self.__consumer.commit()
                except json.JSONDecodeError as e:
                    print(f'Invalid JSON message: {message_value}, error: {e}')
                    self.__consumer.commit()
                except BadRequestException as e:
                    print('Bad Request')
                except Exception as e:
                    print(f'Error processing message: {e}')
                    self.__consumer.commit()
       
        except KeyboardInterrupt:
            print("Прервано пользователем")
        
        finally:
            
            self.__consumer.close()

    def __get_click_message(self, original_message: RawMessage, accident_info: FullParseData) -> Message:
        return Message(
            uuid='',
            source=original_message.source,
            additional_data=json.dumps(original_message.from_info),
            created_at=datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            original_text=original_message.text,
            post_date=original_message.date,
            problem=accident_info.problem,
            location=accident_info.location[0] if len(accident_info.location) > 0 else '',
            problem_date=accident_info.datetime[0] if len(accident_info.datetime) > 0 else ''
        )
    
    def __get_kafka_config(self):
        return {
            'bootstrap.servers': self.__config.kafka_brokers[0],  
            'group.id': self.__config.kafka_consumer_group,        
            'auto.offset.reset': self.__config.kafka_offset_reset_settings,        
            'enable.auto.commit': self.__config.kafka_auto_commit,
            'client.id': self.__config.kafka_consumer_client_id,
            'socket.timeout.ms': self.__config.kafka_socket_timeout_ms,  
            'session.timeout.ms': self.__config.kafka_session_timeout_ms,
        }

    def __create_consumer(self):
        self.__consumer = Consumer(self.__get_kafka_config())
        self.__consumer.subscribe([self.__config.raw_kafka_topic])

    def __parse_raw_message(self, content):
        data = json.loads(content)
        
        if "from" in data: 
            data["from_info"] = data.pop("from")  
        
        return RawMessage(**data)
