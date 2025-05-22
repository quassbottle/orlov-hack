import typing
from cluster.deepseek.client import DeepSeekClient
from service.analyzer.model import FullParseData

from natasha import (
    Segmenter,
    MorphVocab,
    
    NewsEmbedding,
    NewsMorphTagger,
    NewsSyntaxParser,
    NewsNERTagger,
    
    PER,
    NamesExtractor,
    DatesExtractor,
    MoneyExtractor,
    AddrExtractor,

    Doc
)


LOCATION_SPAN = 'LOC'


class AnalyzerService:
    __segmenter: Segmenter
    __morph_vocab: MorphVocab
    __emb: NewsEmbedding
    __morph_tagger: NewsMorphTagger
    __syntax_parser: NewsSyntaxParser
    __ner_tagger: NewsNERTagger
    __addr_extractor: AddrExtractor
    __deep_seek_client: DeepSeekClient
    
    def __init__(self, deep_seek_client: DeepSeekClient):
        self.__segmenter = Segmenter()
        self.__morph_vocab = MorphVocab()
        self.__emb = NewsEmbedding()
        self.__morph_tagger = NewsMorphTagger(self.__emb)
        self.__syntax_parser = NewsSyntaxParser(self.__emb)
        self.__ner_tagger = NewsNERTagger(self.__emb)
        self.__addr_extractor = AddrExtractor(self.__morph_vocab)
        self.__deep_seek_client = deep_seek_client

    def is_accident(self, text: str):
        return self.__deep_seek_client.is_accident(text)
    

    def get_accident_info(self, text: str):
        return self.__deep_seek_client.get_accident_info(text)

    def parse_location(self, text: str) -> typing.List[str]:
        doc = Doc(text)
        doc.segment(self.__segmenter)
        doc.tag_morph(self.__morph_tagger)
        doc.parse_syntax(self.__syntax_parser)
        doc.tag_ner(self.__ner_tagger)

        locations = []
        for span in doc.spans:
            if span.type == 'LOC':  
                locations.append(span.text)

        return locations
        

    def parse_data(self, text: str) -> FullParseData:
        is_accident = self.is_accident(text)

        if is_accident:
            accident_info = self.get_accident_info(text)
            
            return FullParseData(
                location=[accident_info.location if accident_info.location != None else ''],
                is_accident=True,
                datetime=[accident_info.datetime if accident_info.datetime != None else ''],
                problem=accident_info.info if accident_info.info != None else ''
            )
        
        return FullParseData(
            is_accident=False,
            location=[],
            datetime=[],
            problem=''
        )
