from fastapi import APIRouter


class BaseController:
    __router: APIRouter
    def __init__(self):
        self.__router = APIRouter(
            prefix='/base',
            tags=['base']
        )
        self.__register_routes()

    def __register_routes(self):
        @self.__router.get('/ping')
        async def full_parse():
            return 'pong'
    
    def get_router(self) -> APIRouter:
        return self.__router 