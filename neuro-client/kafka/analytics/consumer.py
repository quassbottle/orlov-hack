import json
import time
from confluent_kafka import Consumer, KafkaException
from config.model import Config
from kafka.messages.model import Message

def create_consumer(config: Config):
    conf = {
        'bootstrap.servers': config.kafka_brokers[0],
        'group.id': 'my_consumer_group',      
        'auto.offset.reset': 'earliest',    
        'enable.auto.commit': False,        
        'session.timeout.ms': 6000            
    }
    return Consumer(conf)

def consume_all_messages(consumer, topic, timeout_sec=5):
    consumer.subscribe([topic])
    messages = []
    
    try:
        start_time = time.time()
        
        while True:
            elapsed_time = time.time() - start_time
            if elapsed_time > timeout_sec:
                print("Таймаут: новых сообщений нет.")
                break
            
            msg = consumer.poll(timeout=1.0) 
            if msg is None:
                continue
            
            if msg.error():
                if msg.error().code() == KafkaException._PARTITION_EOF:
                    print("Достигнут конец партиции.")
                    break
                else:
                    print(f"Ошибка: {msg.error()}")
                    break
            
            message_value = msg.value()
            if message_value is None or message_value == None:
                continue

            message_content = message_value.decode('utf-8')
            data = json.loads(message_content)
            
            print(data)

            messages.append(Message(**data))
            
    finally:
        consumer.close()
    
    return messages