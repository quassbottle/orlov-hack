from fastapi import APIRouter

from cluster.deepseek.model import AccidentInfo
from controller.analyzer.dto import ParseRequest, LocationParseResponse, IsAccidentResponse
from service.analyzer.service import AnalyzerService


class AnalyzerController:
    __router: APIRouter
    __analyzer_service: AnalyzerService
    def __init__(self, service: AnalyzerService):
        self.__router = APIRouter(
            prefix='/analyzer',
            tags=['analyzer']
        )
        self.__analyzer_service = service
        self.__register_routes()

    def __register_routes(self):
        @self.__router.post('/parse')
        async def full_parse(payload: ParseRequest):
            return self.__analyzer_service.parse_data(payload.text)
        
        @self.__router.post('/parse-location')
        async def parse_location(payload: ParseRequest) -> LocationParseResponse:
            return LocationParseResponse(locations=self.__analyzer_service.parse_location(payload.text))
        
        @self.__router.post('/is-accident')
        async def is_accident(payload: ParseRequest) -> IsAccidentResponse:
            return IsAccidentResponse(is_accident=self.__analyzer_service.is_accident(payload.text))
        
        @self.__router.post('/accident-info')
        async def get_accident_info(payload: ParseRequest) -> AccidentInfo:
            return self.__analyzer_service.get_accident_info(payload.text)
    
    def get_router(self) -> APIRouter:
        return self.__router 