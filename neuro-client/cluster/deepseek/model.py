from dataclasses import dataclass
import typing


@dataclass
class AccidentInfo:
    location: typing.Optional[str] = None
    datetime: typing.Optional[str] = None
    info: typing.Optional[str] = None