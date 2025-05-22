import typing
from pydantic import BaseModel

class FullParseData(BaseModel):
    location: typing.List[str]
    datetime: typing.List[str]
    problem: str
    is_accident: bool
