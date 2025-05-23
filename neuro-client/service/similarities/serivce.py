from collections import defaultdict
import re
import typing
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from kafka.analytics.consumer import consume_all_messages, create_consumer
from config.model import Config
from sklearn.metrics.pairwise import cosine_similarity

class SimilaritiesService:
    __config: Config
    __sentenceTransformer: SentenceTransformer
    __stop_words: typing.List[str]

    def __init__(self, config: Config, sentenceTransformer: SentenceTransformer, stop_words: typing.List[str]):
        self.__config = config
        self.__sentenceTransformer = sentenceTransformer
        self.__stop_words = stop_words

    def parse(self):
        consumer = create_consumer(self.__config)
        data = consume_all_messages(consumer, self.__config.click_kafka_topic)

        df = self.__parse_data(data)
        embeddings = self.__generate_embeddings(df)
        sim_matrix = cosine_similarity(embeddings)
        results = self.__find_similar_messages(df, sim_matrix)

        return results
    
    def __find_similar_messages(self, df, sim_matrix, base_threshold=0.65):
        """Поиск похожих сообщений с конвертацией типов"""
        results = defaultdict(dict)
        threshold_stats = []
        
        for i, row in df.iterrows():
            similarities = sim_matrix[i]
            q75 = float(np.quantile(similarities, 0.75))
            threshold = max(base_threshold, q75)
            threshold_stats.append(threshold)
            
            similar_indices = np.where(similarities > threshold)[0]
            similar_indices = similar_indices[similar_indices != i]
            
            results[row['uuid']] = {
                'similarity_count': int(len(similar_indices)),
                'similarities': df.iloc[similar_indices]['uuid'].tolist(),
                'original_text': str(row['original_text']),
                'problem': str(row['problem']),
                'threshold': float(round(threshold, 3))
            }
        
        print("\nСтатистика порогов:")
        print(f"Средний порог: {float(np.mean(threshold_stats)):.3f}")
        print(f"Медианный порог: {float(np.median(threshold_stats)):.3f}")
        
        return dict(results)

    def __parse_data(self, data):
        """Подготовка данных из модели"""
        try:
            df = pd.DataFrame(data)
            print("Первые 3 строки данных:")
            print(df.head(3))
            
            required_columns = ['uuid', 'original_text', 'problem']
            missing = [col for col in required_columns if col not in df.columns]
            if missing:
                raise ValueError(f"Отсутствуют колонки: {missing}")
                
            null_counts = df[required_columns].isnull().sum()
            if null_counts.any():
                print("\nПредупреждение: найдены пустые значения:")
                print(null_counts)
                
            return df.dropna(subset=required_columns)
        except Exception as e:
            print(f"Ошибка подготовки данных: {e}")
            exit()

    def __generate_embeddings(self, df):
        """Генерация эмбеддингов с проверкой"""
        texts = df['original_text'].apply(self.__preprocess_text).tolist()
        print("\nПримеры обработанных текстов:")
        for i, text in enumerate(texts[:3]):
            print(f"{i+1}. {text}")

        return self.__sentenceTransformer.encode(texts, show_progress_bar=True)
    
    def __preprocess_text(self, text):
        """Более мягкая очистка текста"""
        text = str(text).lower()
        text = re.sub(r'\d+', '', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        words = re.findall(r"\b[а-яё]{2,}\b", text)
        words = [w for w in words if w not in self.__stop_words]
        return " ".join(words)
