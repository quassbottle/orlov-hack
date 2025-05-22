import typing
from pydantic import BaseModel


class ParseRequest(BaseModel):
    text: str


class LocationParseResponse(BaseModel):
    locations: typing.List[str]

class IsAccidentResponse(BaseModel):
    is_accident: bool