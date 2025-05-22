from fastapi import FastAPI
from app import App
from config.config import parse


CONFIG_SRC = '.config/prod.toml'

cfg = parse(CONFIG_SRC)
app: FastAPI = App(cfg).get_app()

print('started')
