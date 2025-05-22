import typing
from dataclasses import dataclass


@dataclass
class Config:
    kafka_brokers: typing.List[str]
    raw_kafka_topic: str
    click_kafka_topic: str
    kafka_poll: float

    kafka_producer_client_id: str
    kafka_consumer_group: str
    kafka_offset_reset_settings: str
    kafka_auto_commit: bool
    kafka_consumer_client_id: str
    kafka_socket_timeout_ms: int
    kafka_session_timeout_ms: int

    deep_seek_url: str
    deep_seek_token: str
