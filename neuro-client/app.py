import threading
from fastapi import FastAPI
from cluster.deepseek.client import DeepSeekClient
from config.model import Config
from controller.base.controller import BaseController
from controller.analyzer.controller import AnalyzerController
from kafka.messages.consumer import MessagesConsumer
from kafka.messages.producer import MessagesProducer
from service.analyzer.service import AnalyzerService


class App:
    __config: Config
    __app: FastAPI
    __analyzer_service: AnalyzerService
    __deep_seek_client: DeepSeekClient
    __messages_producer: MessagesProducer
    __messages_consumer: MessagesConsumer

    def __init__(self, config: Config):
        self.__config = config
        self.__app = FastAPI()
        
        self.__init_clients()
        self.__init_services()
        self.__init_controllers()
        self.__init_producers()
        self.__init_consumers()

    def __init_clients(self):
        self.__deep_seek_client = DeepSeekClient(self.__config)

    def __init_services(self):
        self.__analyzer_service = AnalyzerService(self.__deep_seek_client)

    def __init_controllers(self):
        base_controller = BaseController()
        analyzer_controller = AnalyzerController(self.__analyzer_service)

        self.__app.include_router(analyzer_controller.get_router())
        self.__app.include_router(base_controller.get_router())

    def __init_producers(self):
        self.__messages_producer = MessagesProducer(self.__config)

    def __init_consumers(self):
        self.__messages_consumer = MessagesConsumer(self.__config, self.__analyzer_service, self.__messages_producer)

        @self.__app.on_event('startup')
        def startup():
            thread = threading.Thread(target=self.__messages_consumer.consume_messages)
            thread.daemon = True  
            thread.start()

    def get_app(self) -> FastAPI:
        return self.__app