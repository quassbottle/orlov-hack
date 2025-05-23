from clickhouse_driver import Client
from config.model import Config
from kafka.messages.model import Message

def get_data():
    connection_params = {
        'host': 'clickhouse',
        'port': '9000', 
        'user': 'admin',    
        'password': 'password',       
        'database': 'default' 
    }

    client = Client(**connection_params)
    res = []

    try:
        query = "SELECT * FROM default.messages"
        result = client.execute(query)

        print(result)

        for row in result:
           res.append(map_message(row))

        return res 

    except Exception as e:
        print(f"Ошибка при выполнении запроса: {e}")

    finally:
        client.disconnect()

def map_message(row):
    return Message(
        uuid=row[0],
        source=row[1],
        additional_data=row[2],
        created_at=row[3],
        original_text=row[4],
        post_date=row[5],
        problem=row[6],
        location=row[7],
        problem_date=row[8]
    )