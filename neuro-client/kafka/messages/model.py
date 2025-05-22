from dataclasses import asdict, dataclass, field
import typing


@dataclass
class Message:
    source: typing.Optional[str] = field(metadata={'json': 'source'}) 
    additional_data: typing.Optional[str] = field(metadata={'json': 'additional_data'}) 
    created_at: typing.Optional[str] = field(metadata={'json': 'created_at'}) 
    original_text: typing.Optional[str] = field(metadata={'json': 'original_text'}) 
    post_date: typing.Optional[str] = field(metadata={'json': 'post_date'}) 
    problem: typing.Optional[str] = field(metadata={'json': 'problem'}) 
    location: typing.Optional[str] = field(metadata={'json': 'location'}) 
    problem_date: typing.Optional[str] = field(metadata={'json': 'problem_date'}) 

    def to_dict(self):
        return asdict(self)


@dataclass
class RawMessageFrom:
    channel_id: typing.Optional[str] = field(metadata={'json': 'channelId'}) 
    class_name: typing.Optional[str] = field(metadata={'json': 'className'}) 


@dataclass
class RawMessage:
    id: typing.Optional[int]
    text: typing.Optional[str]
    from_info: typing.Optional[RawMessageFrom] = field(metadata={'json': 'from'})
    date: typing.Optional[str]
    channel: typing.Optional[str]
    source: typing.Optional[str]