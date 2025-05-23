import threading
import typing
from fastapi import FastAPI
from cluster.deepseek.client import DeepSeekClient
from config.model import Config
from controller.base.controller import BaseController
from controller.analyzer.controller import AnalyzerController
from kafka.messages.consumer import MessagesConsumer
from kafka.messages.producer import MessagesProducer
from service.analyzer.service import AnalyzerService
import nltk
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer
from service.similarities.serivce import SimilaritiesService
from controller.similarities.controller import SimilarityController


class App:
    __config: Config
    __app: FastAPI
    __analyzer_service: AnalyzerService
    __deep_seek_client: DeepSeekClient
    __messages_producer: MessagesProducer
    __messages_consumer: MessagesConsumer
    __stop_words: typing.List[str]
    __sentenceTransformer: SentenceTransformer
    __similarities_service: SimilaritiesService

    def __init__(self, config: Config):
        self.__config = config
        self.__app = FastAPI()
        
        self.__init_words()
        self.__init_ai_model()
        self.__init_clients()
        self.__init_services()
        self.__init_controllers()
        self.__init_producers()
        self.__init_consumers()

    def __init_clients(self):
        self.__deep_seek_client = DeepSeekClient(self.__config)

    def __init_services(self):
        self.__analyzer_service = AnalyzerService(self.__deep_seek_client)
        self.__similarities_service = SimilaritiesService(self.__config, self.__sentenceTransformer, self.__stop_words)

    def __init_controllers(self):
        base_controller = BaseController()
        analyzer_controller = AnalyzerController(self.__analyzer_service)
        similarities_controller = SimilarityController(self.__similarities_service)

        self.__app.include_router(analyzer_controller.get_router())
        self.__app.include_router(base_controller.get_router())
        self.__app.include_router(similarities_controller.get_router())

    def __init_producers(self):
        self.__messages_producer = MessagesProducer(self.__config)

    def __init_consumers(self):
        self.__messages_consumer = MessagesConsumer(self.__config, self.__analyzer_service, self.__messages_producer)

        @self.__app.on_event('startup')
        def startup():
            thread = threading.Thread(target=self.__messages_consumer.consume_messages)
            thread.daemon = True  
            thread.start()

    def __init_words(self):
        nltk.download('stopwords')
        self.__stop_words = stopwords.words('russian')

    def __init_ai_model(self):
        self.__sentenceTransformer = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

    def get_app(self) -> FastAPI:
        return self.__app