import os
from string import Template
from dotenv import load_dotenv
import toml

from config.model import Config


def parse(src: str) -> Config:
    load_dotenv()

    with open(src, 'r') as f:
        config_content = Template(f.read()).substitute(os.environ)
        config_data = toml.load(config_content)
    
    return Config(
        kafka_brokers=config_data['kafka']['brokers'],
        raw_kafka_topic=config_data['kafka']['raw_topic'],
        click_kafka_topic=config_data['kafka']['click_topic'],
        kafka_poll=config_data['kafka']['poll'],

        kafka_producer_client_id=config_data['kafka']['producer_client_id'],
        kafka_consumer_group=config_data['kafka']['consumer_group'],
        kafka_offset_reset_settings=config_data['kafka']['offset_reset_settings'],
        kafka_auto_commit=config_data['kafka']['auto_commit'],
        kafka_consumer_client_id=config_data['kafka']['consumer_client_id'],
        kafka_socket_timeout_ms=config_data['kafka']['socket_timeout_ms'],
        kafka_session_timeout_ms=config_data['kafka']['session_timeout_ms'],

        deep_seek_url=config_data['deep_seek']['url'],
        deep_seek_token=config_data['deep_seek']['token']
    )