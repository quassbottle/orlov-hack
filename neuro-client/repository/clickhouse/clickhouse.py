from clickhouse_driver import Client
from config.model import Config
from kafka.messages.model import Message

def get_data():
    connection_params = {
        'host': 'localhost:8123', 
        'user': 'admin',    
        'password': 'password',       
        'database': 'default' 
    }

    client = Client(**connection_params)
    result = []

    try:
        query = "SELECT * FROM default.messages"
        result = client.execute(query)
    
        for row in result:
           result.append(Message(**row)) 

    except Exception as e:
        print(f"Ошибка при выполнении запроса: {e}")

    finally:
        client.disconnect()