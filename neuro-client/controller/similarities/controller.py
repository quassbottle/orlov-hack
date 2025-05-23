from fastapi import APIRouter
from service.similarities.serivce import SimilaritiesService


class SimilarityController:
    __router: APIRouter
    __similarities_service: SimilaritiesService
    def __init__(self, similarities_service: SimilaritiesService):
        self.__similarities_service = similarities_service
        self.__router = APIRouter(
            prefix='/similarities',
            tags=['similarities']
        )
        self.__register_routes()

    def __register_routes(self):
        @self.__router.get('/all')
        async def all():
            return self.__similarities_service.parse()
    
    def get_router(self) -> APIRouter:
        return self.__router 